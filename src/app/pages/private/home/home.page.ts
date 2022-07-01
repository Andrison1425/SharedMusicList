import { LocalDbService } from './../../../services/local-db.service';
import { IStation } from './../../../interfaces/station.interface';
import { StationService } from './../../../services/station.service';
import { StationOrderBy } from './../../../enums/station-order-by.enum';
import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  srcAudio = '';
  musicCont = 0;
  activeTab = 'FAVORITES';
  stations: IStation[] = [];
  favoriteStations: IStation[] = [];
  stationOrderBy = StationOrderBy;
  orderBy: StationOrderBy = StationOrderBy.Likes;

  constructor(
    private menu: MenuController,
    private stationService: StationService,
    private localDbService: LocalDbService
  ) {}

  async ngOnInit() {

    this.localDbService.getLocalUser()
      .then(user => {
        this.localDbService.getFavoriteStations(user.id)
          .then(stations => {
            this.favoriteStations = stations;
          })
      })

      this.stationService.getStations(this.stationOrderBy.Likes)
        .then(resp => {
          this.stations = resp;
          console.log(resp);
        })
        .catch((e) => console.log(e));
    }

  openMenu() {
    this.menu.open('home-menu');
  }

  segmentChanged(ev) {
    if (ev.detail.value === 'EXPLORE') {
      this.activeTab = 'EXPLORE';
    }else {
      this.activeTab = 'FAVORITES';
    }
  }

  setOrderBy() {
    this.stationService.getStations(this.orderBy)
      .then(resp => {
        this.stations = resp;
        console.log(resp);
      })
      .catch((e) => console.log(e));
  }
}
