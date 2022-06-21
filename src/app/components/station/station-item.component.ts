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


  constructor(
    private alertController: AlertController,
    private musicService: MusicService,
    private stationService: StationService,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private router: Router,
    private localDbService: LocalDbService,
    private userService: UserService
  ) {
  }

  ngOnInit() {
    if (this.playing) {
      this.load();

      this.musicPlaying = this.musicService.musicPlaying;
      this.musicService.musicPlayingInfo()
        .subscribe(resp => {
          this.musicPlaying = resp.music;
        });

      this.stationService.addView(this.station.id);
    }

    this.localDbService.getLocalUser()
      .then(user => {
        this.user = user;

        for (const key of Object.keys(this.station.reactions.idUsersAndReaction)) {
          if (key === this.user.id) {
            this.reaction = this.station.reactions.idUsersAndReaction[key];
          }
        }

        if (user.favoriteStations.includes(this.station.id)) {
          this.isFavoriteStation = true;
        }

        if (this.user.id === this.station.author.id) {
          if (this.adminStation) {
            this.syncStation();
          }
        } else {
          this.showFavoriteOption = true;
        }

      });

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

  addToFavorites() {
    this.isFavoriteStation = true;
    this.userService.addFavoriteStation(this.station);
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

}
