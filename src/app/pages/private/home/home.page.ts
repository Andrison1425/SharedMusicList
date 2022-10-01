import { LocalDbService } from './../../../services/local-db.service';
import { IPlaylist } from '../../../interfaces/playlist.interface';
import { Component, OnInit } from '@angular/core';
import { MenuController, ModalController } from '@ionic/angular';
import { FiltersModalComponent } from 'src/app/components/filters-modal/filters-modal.component';
import { PlaylistService } from 'src/app/services/playlist.service';
import { IFilters } from 'src/app/interfaces/filters.interface';
import { StationOrderBy } from 'src/app/enums/station-order-by.enum';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  srcAudio = '';
  musicCont = 0;
  activeTab = 'FAVORITES';
  allStations: IPlaylist[] = [];
  stations: IPlaylist[] = [];
  favoriteStations: IPlaylist[] = [];
  stationOrderByEnum = StationOrderBy;
  stationOrderBy: StationOrderBy = StationOrderBy.Likes;
  tags: string[] = [];
  cantFilters = 1;
  connectionError = false;
  searchTxt = '';

  constructor(
    private menu: MenuController,
    private localDbService: LocalDbService,
    private modalController: ModalController,
    private playlistService: PlaylistService
  ) { }
  
  async ngOnInit() {
    this.localDbService.getLocalUser()
      .then(async (user) => {
        const favStations = await this.localDbService.getFavoriteStations(user.id);
        this.favoriteStations = favStations;

        this.localDbService.favoriteStationsData()
          .subscribe(resp => {
            this.favoriteStations = resp;
            if (this.favoriteStations.length === 0) {
              this.activeTab = 'EXPLORE';
            }
          });
      });

    this.getStations();
  }

  openMenu() {
    this.menu.open('home-menu');
  }

  segmentChanged(ev) {
    if (ev.detail.value === 'EXPLORE') {
      this.activeTab = 'EXPLORE';
    } else {
      this.activeTab = 'FAVORITES';
    }
  }

  async openFiltersModal() {
    const modal = await this.modalController.create({
      component: FiltersModalComponent,
      componentProps: {
        orderBy: this.stationOrderBy,
        tags: this.tags
      }
    });

    modal.present();

    modal.onDidDismiss()
      .then(({data}) => {
        const filters = data as IFilters;

        this.stationOrderBy = filters.orderBy;
        this.tags = filters.tags;
        if (filters.tags?.length > 0) {
          this.cantFilters = 2;
        } else {
          this.cantFilters = 1;
        }

        this.getStations();
      });
  }

  getStations() {
    const filters: IFilters = {
      orderBy: this.stationOrderBy,
      search: this.searchTxt,
      tags: this.tags
    };

    this.stations = [];
    this.connectionError = false;
    this.playlistService.getStations(filters)
      .then(resp => {
        this.connectionError = resp.connectionError;
        this.allStations = resp.stations;
        this.stations = this.allStations.slice(0, 15);
      })
      .catch((e) => console.log(e));
  }

  loadData(event) {
    this.stations = this.allStations.slice(0, this.stations.length + 15);
    
    event.target.complete();

    if (this.stations.length >= this.allStations.length) {
      event.target.disabled = true;
    }
  }

  trackByFn(index: number, item: IPlaylist) {
    return item.id;
  }

  search() {

  }
}
