import { HttpClient, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject, Subscription } from 'rxjs';
import { IMusic } from '../interfaces/music.interface';
import { convertBlobToBase64 } from '../utils/utils';
import { FileSystemService } from '../services/file-system.service'
import { Folder } from '../enums/folder.enum';
import { IDownload } from '../interfaces/download.interface';
import { DownloadState } from '../enums/download-state.enum';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import * as uniqid from 'uniqid';
import { LocalDbService } from './local-db.service';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  private showDownloadsModal$ = new Subject<boolean>();
  private myDownloads$ = new ReplaySubject<IDownload>(1);
  private httpSubscriptions: {
    [musicId: string]: Subscription
  } = {};
  musicPlaying: IMusic;
  Folder: Folder;
  downloads: IDownload = {};

  constructor(
    private http: HttpClient,
    private fileSystemService: FileSystemService,
    private fileOpener: FileOpener,
    private localDbService: LocalDbService
  ) { }

  showDownloadsModal() {
    this.showDownloadsModal$.next(true);
  }

  onShowDownloadsModal() {
    return this.showDownloadsModal$.asObservable();
  }

  downloadMusic(music: IMusic) {
    this.downloads[music.id] = {
      music: music,
      progress: 0,
      state: DownloadState.DOWNLOADING,
      id: uniqid(),
      fileUri: ''
    }

    this.httpSubscriptions[music.id] =
      this.http.get(music.downloadUrl, {
        responseType: 'blob',
        reportProgress: true,
        observe: 'events'
      })
        .subscribe(async event => {
          if (event.type === HttpEventType.DownloadProgress) {
            this.downloads[music.id].progress = (100 * event.loaded) / event.total;
            this.myDownloads$.next(this.downloads)

          } else if (event.type === HttpEventType.Response) {
            let base64: string | ArrayBuffer;
            this.downloads[music.id].state = DownloadState.DOWNLOADED;

            const resultData = await convertBlobToBase64(event.body)
            base64 = resultData as string | ArrayBuffer;

            const downloadUri = await this.fileSystemService.writeFile(base64 as string,
              `${music.title + music.id}.mp3`,
              `${Folder.Tracks}`
            )

            this.downloads[music.id].fileUri = downloadUri;
            this.localDbService.addMusicDownload(this.downloads[music.id]);
            this.myDownloads$.next(this.downloads)
          }
        });
  }

  getDownloads(): Observable<IDownload> {
    return this.myDownloads$.asObservable();
  }

  cancelDownload(music: IMusic) {
    this.downloads[music.id] = {
      ...this.downloads[music.id],
      state: DownloadState.CANCELLED
    }
    this.httpSubscriptions[music.id].unsubscribe()
    this.myDownloads$.next(this.downloads)
  }

  openDownloadInExplorer(path: string) {
    this.fileOpener.showOpenWithDialog(path, 'audio/*')
      .then(() => console.log('File is opened'))
      .catch(e => console.log('Error opening file', e));
  }
}
