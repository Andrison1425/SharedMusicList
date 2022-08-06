import { MusicService } from './../../services/music.service';
import { IMusic } from './../../interfaces/music.interface';
import { Component, Input, OnInit } from '@angular/core';
import { MusicState } from 'src/app/enums/music-state.enum';

@Component({
  selector: 'app-track',
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.scss'],
})
export class TrackComponent implements OnInit {

  @Input() track: IMusic;
  @Input() musicPlayingId: string;
  @Input() lastStationView: number;
  @Input() musicState: MusicState;
  newTrack = false;
  musicStateEnum = MusicState;

  constructor(
    private musicService: MusicService
  ) { }

  ngOnInit() {
    // if (this.lastStationView) {
    //   if (Number(this.lastStationView) < new Date(this.track.timestamp.seconds * 1000).valueOf()) {
    //     this.newTrack = true;
    //   }
    // } else {
    //   return false;
    // }
  }

  play(music: IMusic) {
    if (music.id === this.musicPlayingId) {
      this.musicService.play(true, music.id);
    } else {
      this.musicService.play(false, music.id);
    }
  }

  pause() {
    this.musicService.pause();
  }
}
