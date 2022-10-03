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
  stations: IPlaylist[] = [];
  favoriteStations: IPlaylist[] = [];
  cantFilters = 1;
  connectionError = false;
  searchTxt = '';
  showPlaylists = 5;
  disabledInfiniteScroll = false;
  filters: IFilters = {
    orderBy: StationOrderBy.Likes,
    search: '',
    tags: []
  };

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

    this.getPlaylists();
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
        orderBy: this.filters.orderBy,
        tags: this.filters.tags
      }
    });

    modal.present();

    modal.onDidDismiss()
      .then(({data}) => {
        const filters = data as IFilters;

        this.filters.orderBy = filters.orderBy;
        this.filters.tags = filters.tags;
        if (filters.tags?.length > 0) {
          this.cantFilters = 2;
        } else {
          this.cantFilters = 1;
        }
        this.showPlaylists = 5;
        this.stations = [];

        this.getPlaylists();
      });
  }

  async getPlaylists() {
    this.connectionError = false;
    try {
      const resp = await this.playlistService.getPlaylists(this.filters, this.showPlaylists - 5);
  
      if (resp.stations.length === 0) {
        this.disabledInfiniteScroll = true;
      } else {
        this.disabledInfiniteScroll = false;
      }
  
      this.connectionError = resp.connectionError;
      this.stations.push(...resp.stations);  
    } catch (error) {
      this.connectionError = true;
    }
  }

  async loadData(event) {
    if (this.disabledInfiniteScroll) {
      event.target.complete();
    } else {
      this.showPlaylists += 5;
  
      await this.getPlaylists();
      
      event.target.complete();
    }
  }

  trackByFn(index: number, item: IPlaylist) {
    return item.id;
  }

  search() {

  }
}
