import { Capacitor } from '@capacitor/core';
import { Folder } from './../enums/folder.enum';
import { FileSystemService } from './file-system.service';
import { MusicState } from './../enums/music-state.enum';
import { ReplaySubject, Subject } from 'rxjs';
import { Howl } from 'howler';
import { FirebaseStorageRoute } from './../enums/firebase-storage-route.enum';
import { IMusic } from './../interfaces/music.interface';
import { Injectable } from '@angular/core';
import { ref, uploadString, getStorage, getDownloadURL } from '@angular/fire/storage';
import * as uniqid from 'uniqid';
import { LocalDbService } from './local-db.service';
import { ToastService } from './toast.service';
import { Colors } from '../enums/color.enum';
import { DownloadService } from './download.service';
import { LoadingService } from './loading.service';

@Injectable({
  providedIn: 'root'
})
export class MusicService {

  player: Howl;
  musicPlayingIndex = 0;
  musics: IMusic[] = [];
  musicsUrlDownload: string[] = [];
  musicPlaying: IMusic;
  seek = 0;
  interval: NodeJS.Timeout;
  private musicPlayingInfo$ = new ReplaySubject<{music: IMusic, state: MusicState}>(1);
  private seek$ = new Subject<number>();

  constructor(
    private fileSystemService: FileSystemService,
    private localDbService: LocalDbService,
    private toastService: ToastService,
    private downloadService: DownloadService,
    private loadingService: LoadingService
  ) {/** */ }

  async uploadMusic(music: IMusic, stationID: string, stationName: string, saveInLocal: boolean = true) {
    return new Promise<{ downloadUrl: string; localPath: string; }>((resolve, rejeact) => {
      (async () => {
        try {
          const locationRef = ref(
            getStorage(),
            `${FirebaseStorageRoute.Musics + stationID}/${uniqid()}.mp3`
          );

          const upload = await uploadString(locationRef, music.localData, 'data_url')
            .catch(e => {
              console.log('Un error', e); 
              rejeact(e);
            })

          if (!upload) {
            return ;
          }

          const downloadUrl = await getDownloadURL(upload.ref);
          let localPath = '';
          if (saveInLocal) {
            localPath = await this.fileSystemService.writeFile(music.localData, `${music.title + music.id}.mp3`, `${Folder.Tracks + stationName}/`)
          }
          resolve({downloadUrl, localPath});
        } catch (error) {
          console.log('fallo', error)
          rejeact(error);
        }
      })();
    });
  }

  loadMusics(musics: IMusic[]) {
    this.musics = musics;
    this.musicPlaying = musics[0];
    musics.forEach((music, i) => {
      this.musicsUrlDownload[i] = Capacitor.convertFileSrc(music.localPath) || music.downloadUrl;
    });
  }

  play(resume?: boolean, musicId?: string) {
    if(resume) {
      this.player.play();
      this.musicPlayingInfo$.next({
        music: this.musics[this.musicPlayingIndex],
        state: MusicState.Playing
      });
    } else {
      this.player?.stop();

      if (musicId !== undefined) {
        for (let index = 0; index < this.musics.length; index++) {
          const element = this.musics[index];
          if (element.id === musicId) {
            this.musicPlayingIndex = index;
            break;
          }
        }
      }

      this.player = new Howl({
        src: [this.musicsUrlDownload[this.musicPlayingIndex]],
        html5: true,
        onseek: (e) => {
          console.log(e)
        },
        onplay: () => {
          this.updateSeek();
        },
        onpause: () => {
          clearInterval(this.interval);
        },
        onend: () => {
          clearInterval(this.interval);
        }
      });

      this.player.play();
      this.musicPlaying = this.musics[this.musicPlayingIndex];
      this.musicPlayingInfo$.next({
        music: this.musics[this.musicPlayingIndex],
        state: MusicState.Playing
      });

      this.player.on('end', () => {
        this.next();
      });
    }
  }

  pause() {
    this.player.pause();
    this.musicPlayingInfo$.next({
      music: this.musics[this.musicPlayingIndex],
      state: MusicState.Pause
    });
  }

  musicPlayingInfo() {
    return this.musicPlayingInfo$.asObservable();
  }

  getSeek() {
    return this.seek$.asObservable();
  }

  updateSeek() {
    const seek = this.player.seek();
    this.seek$.next(seek);
    this.interval = setTimeout(() => {
      this.updateSeek();
    }, 100);
  }

  next() {
    this.musicPlayingIndex++;
    if (this.musicPlayingIndex === this.musics.length) {
      this.musicPlayingIndex = 0;
    }
    this.play();
  }

  previous() {
    this.musicPlayingIndex--;
    if (this.musicPlayingIndex === -1) {
      this.musicPlayingIndex = this.musics.length - 1;
    }
    this.play();
  }

  close() {
    clearInterval(this.interval);
    this.player.stop();
    this.musicPlayingInfo$.next({
      music: null,
      state: null
    });
  }

  addTrackInPlaylist(track: IMusic, playlistID: string) {
    this.localDbService.getStation(playlistID)
      .then(async resp => {
        if (resp) {
          this.loadingService.present('Descargando canción');
          console.log(track);
          track.id = uniqid();
          track.stationId = playlistID;
          try {
            const localPath = await this.downloadService.downloadMusic(track, `${track.title + '--' + track.id}.mp3`, `${Folder.Tracks + resp.name}/`)
            track.localPath = localPath;
            track.localData = '';       
            await this.localDbService.setStation(playlistID, {
              ...resp,
              musics: [track, ...resp.musics]
            })
            this.loadingService.dismiss();
            this.toastService.presentToast('Canción agregada', Colors.SUCCESS, 1500); 
          } catch (error) {
            this.loadingService.dismiss();
            this.toastService.presentToast('Error de conexión', Colors.DANGER, 1500);
          }
        } else {
          this.toastService.presentToast('Lista de producción no encontrada', Colors.DANGER, 1500);
        }
      })
  }
}
