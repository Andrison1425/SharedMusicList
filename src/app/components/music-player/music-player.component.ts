import { Router } from '@angular/router';
import { IonRange } from '@ionic/angular';
import { IMusic } from './../../interfaces/music.interface';
import { MusicState } from './../../enums/music-state.enum';
import { MusicService } from './../../services/music.service';
import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-music-player',
  templateUrl: './music-player.component.html',
  styleUrls: ['./music-player.component.scss'],
})
export class MusicPlayerComponent implements OnInit {

  musicState: MusicState;
  musicStateEnum = MusicState;
  music: IMusic;
  progress = 0;
  @ViewChild('range') range: IonRange;

  constructor(
    private musicService: MusicService,
    private router: Router
  ) {/** */ }

  ngOnInit() {
    this.musicState = MusicState.Pause;

    this.musicService.musicPlayingInfo()
      .subscribe(resp => {
        if(this.music !== resp.music) {
          this.progress = 0;
        }
        this.music = resp.music;
        this.musicState = resp.state;
      });

    this.musicService.getProgress()
      .subscribe(resp => {
        this.progress = resp;
      });
  }

  play(music: IMusic) {
    this.musicService.play(true, music.id);
  }

  pause() {
    this.musicService.pause();
  }

  next() {
    this.musicService.next();
  }

  previous() {
    this.musicService.previous();
  }

  tooglePlayer() {
    if (this.musicState === this.musicStateEnum.Pause) {
      this.musicService.play(true);
    } else {
      this.pause();
    }
  }

  seek() {
    const newValue = +this.range.value;
    const duration = this.music.duration;
    this.musicService.player.seek(duration * (newValue / 100));
    this.tooglePlayer();
  }

  goStation() {
    this.router.navigate(['radio/station/' + this.music.stationId]);
  }
}
