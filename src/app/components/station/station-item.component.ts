import { Capacitor } from '@capacitor/core';
import { UserService } from './../../services/user.service';
import { LocalDbService } from './../../services/local-db.service';
import { StationService } from './../../services/station.service';
import { IMusic } from './../../interfaces/music.interface';
import { Router } from '@angular/router';
import { ToastService } from './../../services/toast.service';
import { LoadingService } from './../../services/loading.service';
import { MusicService } from './../../services/music.service';
import { IStation } from './../../interfaces/station.interface';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Colors } from 'src/app/enums/color.enum';
import { IUser } from 'src/app/interfaces/user.interface';
import { Reaction } from 'src/app/enums/reaction.enum';
import { Share } from '@capacitor/share';
import { LocalNotificationsService } from 'src/app/services/local-notifications.service';
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

  @Input() station: IStation;
  @Input() playing = false;
  @Input() adminStation = true;
  @Output() deleteStation = new EventEmitter<string>();
  showFavoriteOption = false;
  isFavoriteStation = false;
  musicPlaying: IMusic;
  user: IUser;
  reactionEnum = Reaction;
  reaction: Reaction;
  percentageReaction = 50;
  private units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  constructor(
    private alertController: AlertController,
    private musicService: MusicService,
    private stationService: StationService,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private router: Router,
    private localDbService: LocalDbService,
    private userService: UserService,
    private localNotificationsService: LocalNotificationsService,
    private downloadService: DownloadService
  ) {
  }

  ngOnInit() {
    if (this.playing) {
      this.load();

      this.musicPlaying = this.musicService.musicPlaying;
      this.musicService.musicPlayingInfo()
        .subscribe(resp => {
          if (resp.music) {
            this.musicPlaying = resp.music;
          }
        });

      if (this.station.type !== PlaylistType.PRIVATE) {
        this.stationService.addView(this.station.id);
      }
    }

    this.localDbService.getLocalUser()
      .then(user => {
        this.user = user;

        //Check if the user reacted on this list
        for (const key of Object.keys(this.station.reactions.idUsersAndReaction)) {
          if (key === this.user.id) {
            this.reaction = this.station.reactions.idUsersAndReaction[key];
          }
        }

        if (user.favoriteStations.includes(this.station.id)) {
          this.isFavoriteStation = true;
          if (this.station.type !== PlaylistType.PRIVATE) {
            this.syncStation();
          }
        }

        if (this.user.id === this.station.author.id) {
          if (this.adminStation) {
            if (this.station.type !== PlaylistType.PRIVATE) {
              this.syncStation();
            }
          }
        } else {
          this.showFavoriteOption = true;
        }

      });

    //Porcentage of like
    if (this.station.reactions.numLikes) {
      this.percentageReaction =
        ((this.station.reactions.numDislikes + this.station.reactions.numLikes) * 100) / this.station.reactions.numLikes;
    } else {
      this.percentageReaction = 0;
    }

    if (this.station.image.localPath) {
      this.station.image.localPath = Capacitor.convertFileSrc(this.station.image.localPath);
    }
  }

  load() {
    this.musicService.loadMusics(this.station.musics);
  }

  async delete() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Desea eliminar esta estación?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        }, {
          text: 'Eliminar',
          id: 'confirm-button',
          handler: () => {
            this.loadingService.present('Eliminando...');

            this.stationService.deleteStation(this.station.id)
              .then(() => {
                this.loadingService.dismiss();
                this.deleteStation.emit(this.station.id);
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
  
              this.userService.removeFavoriteStation(this.station.id)
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
      this.userService.addFavoriteStation(this.station)
        .then(() => {
          this.toastService.presentToast('Agregado a favoritos.', Colors.SUCCESS,1500);
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
      this.stationService.setReaction(this.station.id, this.user.id, reaction);
      this.reaction = reaction;
      if (reaction === Reaction.Like) {
        this.station.reactions.numLikes++;
      } else {
        this.station.reactions.numDislikes++;
      }
    }
  }

  syncStation() {
    this.stationService.syncStation(this.station.id)
    .then(resp => {
      this.station = resp;
      if (this.station.reactions.numLikes) {
        this.percentageReaction =
          ((this.station.reactions.numDislikes + this.station.reactions.numLikes) * 100) / this.station.reactions.numLikes;
      } else {
        this.percentageReaction = 0;
      }
      for (const key of Object.keys(this.station.reactions.idUsersAndReaction)) {
        if (key === this.user.id) {
          this.reaction = this.station.reactions.idUsersAndReaction[key];
        }
      }
    });
  }

  async share() {
    await Share.share({
      title: 'Compartir',
      text: 'Escucha la música disponible en esta lista',
      url: environment.deeplinkBase + Deeplink.PLAYLIST + this.station.id,
      dialogTitle: 'Compartir',
    });
  }

  async edit() {
    this.router.navigate(['/radio/create-station/' + this.station.id]);
  }

  async downloadMusic(music: IMusic) {
    const alert = await this.alertController.create({
      message: `
        ¿Descargar ${music.title} - ${music.artist}? 
        <br> 
        <small>${this.getMusicSize(music.size)}</small>
      `,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        }, {
          text: 'Descargar',
          id: 'confirm-button',
          handler: () => {
            this.downloadService.showDownloadsModal();
            this.downloadService.downloadMusic(this.musicPlaying);
          }
        }
      ]
    });

    await alert.present();
  }

  private getMusicSize(x: number) {
    let l = 0;
    let n = x || 0;

    while (n >= 1024 && ++l) {
      n = n / 1024;
    }
    return (n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + this.units[l]);
  }
}
