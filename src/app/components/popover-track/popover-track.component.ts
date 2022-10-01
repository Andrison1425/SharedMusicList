import { Component, OnInit } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import { IMusic } from 'src/app/interfaces/music.interface';
import { DownloadService } from 'src/app/services/download.service';

@Component({
  selector: 'app-popover-track',
  templateUrl: './popover-track.component.html',
  styleUrls: ['./popover-track.component.scss'],
})
export class PopoverTrackComponent implements OnInit {

  track: IMusic;

  constructor(
    private navParams: NavParams,
    private downloadService: DownloadService,
    private popoverController: PopoverController
  ) { }

  ngOnInit() {
    this.track = this.navParams.data.track;
  }

  download() {
    this.downloadService.downloadMusicWithAlert(this.track);
    this.popoverController.dismiss();
  }

}
