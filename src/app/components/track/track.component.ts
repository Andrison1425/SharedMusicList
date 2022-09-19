import { MusicService } from './../../services/music.service';
import { IMusic } from './../../interfaces/music.interface';
import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MusicState } from 'src/app/enums/music-state.enum';

@Component({
  selector: 'app-track',
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.scss'],
})
export class TrackComponent implements OnInit, AfterViewInit {

  @Input() track: IMusic;
  @Input() musicPlayingId: string;
  @Input() lastStationView: number;
  @Input() musicState: MusicState;
  @Input() trackId?: string;
  @ViewChild('trackItem') trackItem: any;
  musicStateEnum = MusicState;

  constructor(
    private musicService: MusicService,
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    if (this.trackId === this.track.id) {

      setTimeout(() => {
        this.trackItem.el.scrollIntoView(false);
      }, 220);
    }
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
