import { IMusic } from './../interfaces/music.interface';
import { MusicService } from './music.service';
import { BackgroundMode } from '@awesome-cordova-plugins/background-mode/ngx';
import { Injectable } from '@angular/core';
import { MusicControls } from '@awesome-cordova-plugins/music-controls/ngx';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackgroundModeService {

  existListeners = false;
  isBackground = false;
  music: IMusic;
  musicSubscription: Subscription;

  constructor(
    private backgroundMode: BackgroundMode,
    private musicService: MusicService,
    private musicControls: MusicControls
  ) { }

  initialize() {
    this.musicService.musicPlayingInfo()
      .subscribe(resp => {
        if (resp.music) {
          if (this.music?.id !== resp.music.id) {
            this.music = resp.music;
            if (this.isBackground) {
              console.log('b')
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
      console.log('active')
      if (this.music) {
        this.isBackground = true;
        this.createMusicControls();
      }
    });

    this.backgroundMode.on('deactivate').subscribe(() => {
      this.isBackground = false;
      this.musicControls.updateIsPlaying(false);
      this.musicControls.destroy();
    });
  }

  private createMusicControls() {
    console.log('create')
    this.musicControls.create({
      track: this.music.title,
      artist: this.music.artist,
      cover: 'assets/img/no-image.png',
      isPlaying: true,
      dismissable: false,
      hasPrev: true,
      hasNext: true,
      hasClose: true,
      
      ticker: 'Now playing "Time is Running Out"',
      playIcon: 'media_play',
      pauseIcon: 'media_pause',
      prevIcon: 'media_prev',
      nextIcon: 'media_next',
      closeIcon: 'media_close',
      notificationIcon: 'bg_icon'
    }).then(() => {
      if (this.musicSubscription) {
        this.musicSubscription.unsubscribe();
      }
      this.addListeners()
    })
      .catch(e => console.log(e));
  }

  addListeners() {
    this.musicSubscription = this.musicControls.subscribe().subscribe(action => {

      const message = JSON.parse(action).message;
      switch (message) {
        case 'music-controls-next':
          this.musicService.next();
          break;
        case 'music-controls-previous':
          this.musicService.previous();
          break;
        case 'music-controls-pause':
          if (this.isBackground) {
            this.musicService.pause();
          }
          this.musicControls.updateIsPlaying(false);
          break;
        case 'music-controls-play':
          this.musicService.play(true, this.music.id);
          console.log('play')
          this.musicControls.updateIsPlaying(true);
          break;
        case 'music-controls-destroy':
          this.musicSubscription?.unsubscribe();
          this.musicControls.destroy()
          console.log('destroy')
          if (this.isBackground) {
            this.musicService.close();
          }
          break;
        default:
          break;
      }
    });

    this.musicControls.listen(); // activates the observable above
  }
}
