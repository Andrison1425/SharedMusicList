import { IPlaylist } from '../../../interfaces/playlist.interface';
import { LocalDbService } from './../../../services/local-db.service';
import { IUser } from './../../../interfaces/user.interface';
import { Component, OnInit } from '@angular/core';
import { Route } from 'src/app/enums/route.enum';
import { PlaylistType } from 'src/app/enums/playlist-type.enum';

@Component({
  selector: 'app-playlists',
  templateUrl: './playlists.page.html',
  styleUrls: ['./playlists.page.scss'],
})
export class PlaylistsPage implements OnInit {

  Routes = Route;
  user: IUser;
  isModalCreateStatioOpen = false;
  playlists: IPlaylist[] = [];
  PlaylistType = PlaylistType;
  
  constructor(
    private localDbService: LocalDbService
  ) { /**/ }

  ngOnInit() {
    this.localDbService.getLocalUser()
      .then(resp => {
        this.user = resp;
        this.localDbService.getMyStations(this.user.id)
          .then(stations => {
            this.playlists = stations.filter(playlist => playlist.type !== PlaylistType.PUBLIC)
          });
      });

    this.localDbService.userData()
      .subscribe(resp => {
        this.user = resp;
      });
  }

  onDeleteStation(id: string) {
    this.playlists = this.playlists.filter(station => station.id !== id);
  }
}
