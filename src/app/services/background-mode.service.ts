import { IMusic } from './../interfaces/music.interface';
import { MusicService } from './music.service';
import { BackgroundMode } from '@awesome-cordova-plugins/background-mode/ngx';
import { Injectable } from '@angular/core';
import { CapacitorMusicControls } from 'capacitor-v3-music-controls';

@Injectable({
  providedIn: 'root'
})
export class BackgroundModeService {

  existListeners = false;
  isBackground = false;
  music: IMusic;

  constructor(
    private backgroundMode: BackgroundMode,
    private musicService: MusicService
  ) { }

  initialize() {
    this.musicService.musicPlayingInfo()
      .subscribe(resp => {
        if (resp.music) {
          if (this.music?.id !== resp.music.id) {
            this.music = resp.music;
            if (this.isBackground) {
              console.log('isBackground');
              this.createMusicControls();
            }
          } else {
            this.music = resp.music;
          }
        } else {
          this.music = null;
        }
      });

    this.backgroundMode.enable();
    this.backgroundMode.disableWebViewOptimizations();

    this.backgroundMode.on('activate').subscribe(() => {
      if (this.music) {
        this.isBackground = true;
        this.createMusicControls();
      }
    });
  }

  private createMusicControls() {
    CapacitorMusicControls.create({
      track       : this.music.title,
      artist      : this.music.artist,
      cover       : 'albums/absolution.jpg',
      isPlaying   : true,
      dismissable : false,
      hasPrev   : true,
      hasNext   : true,
      hasClose  : true,
      ticker    : 'Now playing "Time is Running Out"',
      playIcon: 'media_play',
      pauseIcon: 'media_pause',
      prevIcon: 'media_prev',
      nextIcon: 'media_next',
      closeIcon: 'media_close',
      notificationIcon: 'notification'
    }).then(() => this.addListeners())
    .catch(e=>console.log(e));
  }

  addListeners() {
    if (!this.existListeners) {
      CapacitorMusicControls.addListener('controlsNotification', info => {
        switch (info.message) {
          case 'music-controls-next':
            this.musicService.next();
            break;
          case 'music-controls-previous':
            this.musicService.previous();
            break;
          case 'music-controls-pause':
            this.musicService.pause();
            CapacitorMusicControls.updateIsPlaying({
              isPlaying: false
          });
            break;
          case 'music-controls-play':
            this.musicService.play(true, this.music.id);
            CapacitorMusicControls.updateIsPlaying({
              isPlaying: true
          });
            break;
          case 'music-controls-destroy':
            this.musicService.close();
            break;
        }
      });
      this.existListeners = true;
    }
  }
}
