import { IStation } from './../../../interfaces/station.interface';
import { LocalDbService } from './../../../services/local-db.service';
import { Component, OnInit } from '@angular/core';
import { Route } from 'src/app/enums/route.enum';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-station',
  templateUrl: './station.page.html',
  styleUrls: ['./station.page.scss'],
})
export class StationPage implements OnInit {

  Routes = Route;
  station: IStation;
  stationID: string;

  constructor(
    private route: ActivatedRoute,
    private localDbService: LocalDbService
  ) { }

  ngOnInit() {
    this.stationID = this.route.snapshot.paramMap.get('id');
    this.localDbService.getStation(this.stationID)
      .then(resp => {
        this.station = resp;
      });
  }

}
