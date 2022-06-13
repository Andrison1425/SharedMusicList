import { ToastService } from './../../services/toast.service';
import { LoadingService } from './../../services/loading.service';
import { MusicService } from './../../services/music.service';
import { LocalDbService } from './../../services/local-db.service';
import { IStation } from './../../interfaces/station.interface';
import { Component, Input, OnInit } from '@angular/core';
import {Howl, Howler} from 'howler';
import { AlertController } from '@ionic/angular';
import { Colors } from 'src/app/enums/color.enum';

@Component({
  selector: 'app-station-item',
  templateUrl: './station-item.component.html',
  styleUrls: ['./station-item.component.scss'],
})
export class StationItemComponent implements OnInit {

  @Input() station: IStation;
  @Input() playing = false;
  musics: string[] = [];
  player: Howler;
  musicPlaying = 0;

  constructor(
    private localDbService: LocalDbService,
    private alertController: AlertController,
    private musicService: MusicService,
    private loadingService: LoadingService,
    private toastService: ToastService
  ) {
  }

  ngOnInit() {
    if(this.playing) {
      this.station?.musics.forEach(music => {
        this.musics.push(music.downloadUrl);
      });

      this.play();
    }
  }

  play() {
    this.player = new Howl({
      src: [this.musics[this.musicPlaying]],
      html5: true
    });
    this.player.play();

    // Fires when the this.player finishes playing.
    this.player.on('end', function(){
      this.player.play();
    });
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

            this.musicService.deleteStation(this.station.id)
              .then(() => {
                this.loadingService.dismiss();
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

}
