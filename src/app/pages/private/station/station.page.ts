import { StationService } from './../../../services/station.service';
import { IMusic } from './../../../interfaces/music.interface';
import { MusicService } from './../../../services/music.service';
import { IStation } from './../../../interfaces/station.interface';
import { LocalDbService } from './../../../services/local-db.service';
import { Component, OnInit } from '@angular/core';
import { Route } from 'src/app/enums/route.enum';
import { ActivatedRoute } from '@angular/router';
import { MusicState } from 'src/app/enums/music-state.enum';

@Component({
  selector: 'app-station',
  templateUrl: './station.page.html',
  styleUrls: ['./station.page.scss'],
})
export class StationPage implements OnInit {

  Routes = Route;
  station: IStation;
  stationID: string;
  musicPlayingId:number;
  musicState: MusicState;
  musicStateEnum = MusicState;

  constructor(
    private route: ActivatedRoute,
    private localDbService: LocalDbService,
    private musicService: MusicService,
    private stationService: StationService
  ) { }

  ngOnInit() {
    this.stationID = this.route.snapshot.paramMap.get('id');
    this.localDbService.getStation(this.stationID)
      .then(resp => {
        if (resp) {
          this.station = resp;
          this.musicState = MusicState.Pause;

          this.musicService.musicPlayingInfo()
            .subscribe(resp => {
              this.musicPlayingId = resp.music.id;
              this.musicState = resp.state;
            });
        } else {
          this.stationService.getStation(this.stationID)
            .then(station => {
              this.station = station;
            })
        }
      });
  }

  play(music: IMusic) {
    if (music.id === this.musicPlayingId){
      this.musicService.play(true, music.id);
    } else {
      this.musicService.play(false, music.id);
    }
  }

  pause() {
    this.musicService.pause();
  }

  trackByFn(index: number, music: IMusic) {
    return music.id;
  }
}
