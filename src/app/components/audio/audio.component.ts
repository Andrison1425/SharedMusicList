import { Howl } from 'howler';
import { Component, Input, OnDestroy, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { IonRange } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss'],
})
export class AudioComponent implements OnInit, OnDestroy {

  @Input() audioData: string;
  @Output() duration = new EventEmitter<number>();
  progress = 0;
  player: Howl;
  pause = true;
  interval: NodeJS.Timeout;
  @ViewChild('range') range: IonRange;

  constructor() { /* */}

  ngOnInit() {
    this.controls(Capacitor.convertFileSrc(this.audioData as string));
  }

  ngOnDestroy(): void {
      this.player.unload();
  }

  controls(src: string) {
    this.player = new Howl({
      src: [src],
      format: 'mp3',
      onplay: () => {
        this.updateProgress();
      },
      onpause: () => {
        clearInterval(this.interval);
      },
      onend: () => {
        this.pause = true;
        clearInterval(this.interval);
      },
      onload: () => {
        this.duration.emit(this.player.duration());
      }
    });
  }

  setPause() {
    this.pause = false;
    this.tooglePlayer();
  }

  tooglePlayer() {
    if (this.pause) {
      this.player.play();
    } else {
      this.player.pause();
    }
    this.pause = !this.pause;
  }

  seek() {
    const newValue = +this.range.value;
    const duration = this.player.duration();
    this.player.seek(duration * (newValue / 100));
    this.pause = true;
    this.tooglePlayer();
  }

  updateProgress() {
    const seek = this.player.seek();
    this.progress = (seek / this.player.duration()) * 100 || 0;
    this.interval = setTimeout(() => {
      this.updateProgress();
    }, 100);
  }
}
