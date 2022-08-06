import { Capacitor } from '@capacitor/core';
import { Folder } from './../enums/folder.enum';
import { FileSystemService } from './file-system.service';
import { MusicState } from './../enums/music-state.enum';
import { Subject } from 'rxjs';
import { Howler, Howl } from 'howler';
import { FirebaseStorageRoute } from './../enums/firebase-storage-route.enum';
import { IMusic } from './../interfaces/music.interface';
import { Injectable } from '@angular/core';
import { ref, uploadString, getStorage, getDownloadURL } from '@angular/fire/storage';
import * as uniqid from 'uniqid';

@Injectable({
  providedIn: 'root'
})
export class MusicService {

  player: Howler;
  musicPlayingIndex = 0;
  musics: IMusic[] = [];
  musicsUrlDownload: string[] = [];
  musicPlaying: IMusic;
  progress = 0;
  interval: NodeJS.Timeout;
  private musicPlayingInfo$ = new Subject<{music: IMusic, state: MusicState}>();
  private progress$ = new Subject<number>();

  constructor(
    private fileSystemService: FileSystemService
  ) {/** */ }

  async uploadMusic(music: IMusic, stationID: string, stationName: string) {
    return new Promise<{ downloadUrl: string; localPath: string; }>((resolve, rejeact) => {
      (async () => {
        try {
          const locationRef = ref(
            getStorage(),
            `${FirebaseStorageRoute.Musics + stationID}/${uniqid()}.mp3`
          );

          const upload = await uploadString(locationRef, music.localData, 'data_url');
          const downloadUrl = await getDownloadURL(upload.ref);
          const localPath = await this.fileSystemService.writeFile(music.localData, `${music.title + music.id}.mp3`, `${Folder.Tracks + stationName}/`)
          resolve({downloadUrl, localPath});
        } catch (error) {
          console.log(error)
          rejeact(error);
        }
      })();
    });
  }

  loadMusics(musics: IMusic[]) {
    this.musics = musics;
    this.musicPlaying = musics[0];
    musics.forEach(music => {
      this.musicsUrlDownload[music.id] = Capacitor.convertFileSrc(music.localPath) || music.downloadUrl;
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
        onplay: () => {
          this.updateProgress();
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

  getProgress() {
    return this.progress$.asObservable();
  }

  updateProgress() {
    const seek = this.player.seek();
    const progressCalc = (seek / this.player.duration()) * 100 || 0;
    this.progress = progressCalc;
    this.progress$.next(progressCalc);
    this.interval = setTimeout(() => {
      this.updateProgress();
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
    this.player.stop();
    this.musicPlayingInfo$.next({
      music: null,
      state: null
    });
  }
}
