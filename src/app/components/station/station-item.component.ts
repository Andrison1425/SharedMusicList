import { Capacitor } from '@capacitor/core';
import { UserService } from './../../services/user.service';
import { LocalDbService } from './../../services/local-db.service';
import { PlaylistService } from '../../services/playlist.service';
import { IMusic } from './../../interfaces/music.interface';
import { Router } from '@angular/router';
import { ToastService } from './../../services/toast.service';
import { LoadingService } from './../../services/loading.service';
import { MusicService } from './../../services/music.service';
import { IPlaylist } from '../../interfaces/playlist.interface';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Colors } from 'src/app/enums/color.enum';
import { IUser } from 'src/app/interfaces/user.interface';
import { Reaction } from 'src/app/enums/reaction.enum';
import { Share } from '@capacitor/share';
import { DownloadService } from 'src/app/services/download.service';
import { environment } from 'src/environments/environment.prod';
import { Deeplink } from 'src/app/enums/deeplink.enum';
import { PlaylistType } from 'src/app/enums/playlist-type.enum';

@Component({
  selector: 'app-station-item',
  templateUrl: './station-item.component.html',
  styleUrls: ['./station-item.component.scss'],
})
export class StationItemComponent implements OnInit {

  @Input() playlist: IPlaylist;
  @Input() playing = false;
  @Output() deleteStation = new EventEmitter<string>();
  showFavoriteOption = false;
  adminPlaylist = false;
  isFavoriteStation = false;
  musicPlaying: IMusic;
  user: IUser;
  reactionEnum = Reaction;
  reaction: Reaction;
  percentageReaction = 50;

  constructor(
    private alertController: AlertController,
    private musicService: MusicService,
    private playlistService: PlaylistService,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private router: Router,
    private localDbService: LocalDbService,
    private userService: UserService,
    private downloadService: DownloadService
  ) {
  }

  ngOnInit() {
    if (this.playing) {
      this.musicPlaying = this.musicService.musicPlaying;
      this.musicService.musicPlayingInfo()
        .subscribe(resp => {
          if (resp.music) {
            if (resp.music.stationId === this.playlist.id) {
              this.musicPlaying = resp.music;
            }
          }
        });

      if (!this.musicPlaying) {
        this.musicService.loadMusics(this.playlist.musics)
      }

      if (this.playlist.type !== PlaylistType.PRIVATE) {
        this.playlistService.addView(this.playlist.id);
      }
    }

    this.localDbService.getLocalUser()
      .then(user => {
        this.user = user;
        if (this.playlist.author.id === user.id) {
          this.adminPlaylist = true;
        }
        //Check if the user reacted on this list
        for (const key of Object.keys(this.playlist.reactions.idUsersAndReaction)) {
          if (key === this.user.id) {
            this.reaction = this.playlist.reactions.idUsersAndReaction[key];
          }
        }

        if (user.favoriteStations.includes(this.playlist.id)) {
          this.isFavoriteStation = true;
          if (this.playlist.type !== PlaylistType.PRIVATE) {
            this.syncStation();
          }
        }

        if (this.user.id === this.playlist.author.id) {
          if (this.adminPlaylist) {
            if (this.playlist.type !== PlaylistType.PRIVATE) {
              this.syncStation();
            }
          }
        } else {
          this.showFavoriteOption = true;
        }

      });

    //Porcentage of like
    if (this.playlist.reactions.numLikes) {
      this.percentageReaction =
        (this.playlist.reactions.numLikes * 100) / (this.playlist.reactions.numDislikes + this.playlist.reactions.numLikes);
    } else {
      this.percentageReaction = 0;
    }

    if (this.playlist.image.localPath) {
      this.playlist.image.localPath = Capacitor.convertFileSrc(this.playlist.image.localPath);
    }
  }

  async delete() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Desea eliminar esta lista de reproducción?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        }, {
          text: 'Eliminar',
          id: 'confirm-button',
          handler: () => {
            this.loadingService.present('Eliminando...');

            this.playlistService.deleteStation(this.playlist.id)
              .then(() => {
                this.loadingService.dismiss();
                this.deleteStation.emit(this.playlist.id);
              }).catch(() => {
                this.loadingService.dismiss();
                this.toastService.presentToast('Error de conexión', Colors.DANGER);
              })
          }
        }
      ]
    });

    await alert.present();
  }

  async addToFavorites() {
    if (this.isFavoriteStation) {
      const alert = await this.alertController.create({
        header: 'Confirmar',
        message: '¿Desea quitar esta lista de reproducción de favoritos?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          }, {
            text: 'Quitar',
            id: 'confirm-button',
            handler: () => {
              this.loadingService.present('Eliminando...');

              this.userService.removeFavoriteStation(this.playlist.id)
                .then(() => {
                  this.loadingService.dismiss();
                  this.isFavoriteStation = false;
                }).catch(() => {
                  this.loadingService.dismiss();
                  this.toastService.presentToast('Error de conexión', Colors.DANGER);
                })
            }
          }
        ]
      });

      await alert.present();
    } else {
      this.isFavoriteStation = true;
      this.userService.addFavoriteStation(this.playlist)
        .then(() => {
          this.toastService.presentToast('Agregado a favoritos.', Colors.SUCCESS, 1500);
        })
        .catch(e => {
          console.log(e)
          this.toastService.presentToast('Error de conexión.', Colors.DANGER, 1500);
        });
    }
  }

  goStation(id: string) {
    if (!this.playing) {
      this.router.navigate(['radio/station/' + id]);
    }
  }

  goUser(id: string) {
    if (this.user.id !== id) {
      this.router.navigate(['radio/profile/' + id]);
    }
  }

  setReaction(reaction: Reaction) {
    if (!this.reaction) {
      this.playlistService.setReaction(this.playlist.id, this.user.id, reaction);
      this.reaction = reaction;
      if (reaction === Reaction.Like) {
        this.playlist.reactions.numLikes++;
      } else {
        this.playlist.reactions.numDislikes++;
      }
    }
  }

  syncStation() {
    this.playlistService.syncStation(this.playlist.id)
      .then(resp => {
        this.playlist = resp;
        if (this.playlist.reactions.numLikes) {
          this.percentageReaction =
            ((this.playlist.reactions.numDislikes + this.playlist.reactions.numLikes) * 100) / this.playlist.reactions.numLikes;
        } else {
          this.percentageReaction = 0;
        }
        for (const key of Object.keys(this.playlist.reactions.idUsersAndReaction)) {
          if (key === this.user.id) {
            this.reaction = this.playlist.reactions.idUsersAndReaction[key];
          }
        }
      });
  }

  async share() {
    await Share.share({
      title: 'Compartir',
      text: 'Escucha la música disponible en esta lista',
      url: environment.deeplinkBase + Deeplink.PLAYLIST + this.playlist.id,
      dialogTitle: 'Compartir',
    });
  }

  async edit() {
    this.router.navigate(
      ['/radio/create-station/' + this.playlist.id],
      {
        queryParams: { type: this.playlist.type || PlaylistType.PUBLIC }  
      }
    );
  }

  downloadMusic(music: IMusic) {
    this.downloadService.downloadMusicWithAlert(music);
  }

  get musicIndex() {
    if (this.musicPlaying) {
      if (this.musicPlaying.stationId !== this.playlist.id) {
        return 1;
      } else {
        return this.playlist.musics.findIndex(music => music.id === this.musicPlaying.id) + 1;
      }
    } else {
      return 1;
    }
  }

  highlightItem(id: string) {
    this.router.navigate(['radio/station/' + this.playlist.id], {
      queryParams: { trackId: id }
    });
  }
}
