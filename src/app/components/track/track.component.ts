import { MusicService } from './../../services/music.service';
import { IMusic } from './../../interfaces/music.interface';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MusicState } from 'src/app/enums/music-state.enum';
import { PopoverController } from '@ionic/angular';
import { PopoverTrackComponent } from '../popover-track/popover-track.component';

@Component({
  selector: 'app-track',
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.scss'],
})
export class TrackComponent implements OnInit {

  private _trackId: string;
  @Input() track: IMusic;
  @Input() musicPlayingId: string;
  @Input() lastStationView: number;
  @Input() musicState: MusicState;
  @Input() set trackId(value: string) {
    this._trackId = value;
    if (value === this.track.id) {
      setTimeout(() => {
        this.trackItem.el.scrollIntoView(false);
      }, 220);
    }
  };

  @Output() playMusic = new EventEmitter<IMusic>();
  @ViewChild('trackItem') trackItem: any;
  @ViewChild('svgAnimation') svgAnimation: any;
  musicStateEnum = MusicState;

  constructor(
    private musicService: MusicService,
    private popoverController: PopoverController
  ) { }

  ngOnInit() {
  }

  get trackId(): string {
    return this._trackId;
  }

  play(music: IMusic) {
    this.svgAnimation.nativeElement.unpauseAnimations();
    if (music.id === this.musicPlayingId) {
      this.musicService.play(true, music.id);
    } else {
      this.playMusic.emit(music);
      this.musicService.play(false, music.id);
    }
  }

  pause() {
    this.svgAnimation.nativeElement.pauseAnimations();
    this.musicService.pause();
  }

  async presentPopover(ev) {
    const popover = await this.popoverController.create({
      component: PopoverTrackComponent,
      componentProps: {
        track: this.track
      },
      event: ev
    });
    return await popover.present();
  }
}
