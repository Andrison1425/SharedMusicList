import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PlaylistType } from 'src/app/enums/playlist-type.enum';
import { IMusic } from 'src/app/interfaces/music.interface';
import { IPlaylist } from 'src/app/interfaces/playlist.interface';
import { IUser } from 'src/app/interfaces/user.interface';
import { LocalDbService } from 'src/app/services/local-db.service';
import { MusicService } from 'src/app/services/music.service';
import { PlaylistService } from 'src/app/services/playlist.service';

@Component({
  selector: 'app-add-track-playlist-modal',
  templateUrl: './add-track-playlist-modal.component.html',
  styleUrls: ['./add-track-playlist-modal.component.scss'],
})
export class AddTrackPlaylistModalComponent implements OnInit {

  @Input() track: IMusic;
  user: IUser;
  isModalCreateStatioOpen = false;
  playlists: IPlaylist[] = [];

  constructor(
    private localDbService: LocalDbService,
    private musicService: MusicService,
    private modalController: ModalController,
    private playlistService: PlaylistService
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

  addTrackInPlaylist(id: string) {
    this.musicService.addTrackInPlaylist(this.track, id);
    this.modalController.dismiss()
  }

  createPlaylist() {
    this.playlistService.createPlaylistWithName(this.track);
    this.modalController.dismiss()
  }
}
