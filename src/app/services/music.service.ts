import { MusicState } from './../enums/music-state.enum';
import { Subject } from 'rxjs';
import { Howler, Howl } from 'howler';
import { FirebaseStorageRoute } from './../enums/firebase-storage-route.enum';
import { IMusic } from './../interfaces/music.interface';
import { Injectable } from '@angular/core';
import { ref, uploadString, getStorage, getDownloadURL } from '@angular/fire/storage';
import uniqid from 'uniqid';

@Injectable({
  providedIn: 'root'
})
export class MusicService {

  player: Howler;
  musicPlayingId = 0;
  musics: IMusic[] = [];
  musicsUrlDownload: string[] = [];
  musicPlaying: IMusic;
  progress = 0;
  interval: NodeJS.Timeout;
  private musicPlayingInfo$ = new Subject<{music: IMusic, state: MusicState}>();
  private progress$ = new Subject<number>();

  constructor(
  ) {/** */ }

  async uploadMusic(music: IMusic, stationID: string) {
    return new Promise<string>((resolve, rejeact) => {
      (async () => {
        try {
          const locationRef = ref(
            getStorage(),
            `${FirebaseStorageRoute.Musics + stationID}/${uniqid()}.mp3`
          );

          const upload = await uploadString(locationRef, music.localData, 'data_url');
          const downloadUrl = await getDownloadURL(upload.ref);
          resolve(downloadUrl);
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
      this.musicsUrlDownload[music.id] = music.downloadUrl;
    });
  }

  play(resume?: boolean, musicId?: number) {
    if(resume) {
      this.player.play();
      this.musicPlayingInfo$.next({
        music: this.musics[this.musicPlayingId],
        state: MusicState.Playing
      });
    } else {
      this.player?.stop();

      if (musicId !== undefined) {
        this.musicPlayingId = musicId;
      }

      this.player = new Howl({
        src: [this.musicsUrlDownload[this.musicPlayingId]],
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
      this.musicPlaying = this.musics[this.musicPlayingId];
      this.musicPlayingInfo$.next({
        music: this.musics[this.musicPlayingId],
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
      music: this.musics[this.musicPlayingId],
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
    this.musicPlayingId++;
    if (this.musicPlayingId === this.musics.length) {
      this.musicPlayingId = 0;
    }
    this.play();
  }

  previous() {
    this.musicPlayingId--;
    if (this.musicPlayingId === -1) {
      this.musicPlayingId = this.musics.length - 1;
    }
    this.play();
  }
}
