import { Router } from '@angular/router';
import { LocalDbService } from './../../../services/local-db.service';
import { MusicService } from './../../../services/music.service';
import { LoadingService } from './../../../services/loading.service';
import { Colors } from 'src/app/enums/color.enum';
import { FormBuilder, Validators } from '@angular/forms';
import { IStation } from './../../../interfaces/station.interface';
import { AddMusicComponent } from './../../../components/add-music/add-music.component';
import { IMusic } from './../../../interfaces/music.interface';
import { ToastService } from './../../../services/toast.service';
import { ModalController, IonAccordionGroup, ItemReorderEventDetail } from '@ionic/angular';
import { Route } from 'src/app/enums/route.enum';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import uniqid from 'uniqid';

@Component({
  selector: 'app-create-station',
  templateUrl: './create-station.page.html',
  styleUrls: ['./create-station.page.scss'],
})
export class CreateStationPage implements OnInit {

  Routes = Route;
  musicArr: IMusic[] = [];
  @Input() station?: IStation;
  @ViewChild('accordionForm', { static: false }) accordionForm: IonAccordionGroup;

  stationForm = this.fb.group({
    name: ['', [Validators.required, Validators.min(5)]],
    description: ['', [Validators.required, Validators.min(5)]]
  });
  get stationName() { return this.stationForm.get('name'); }
  get stationDescription() { return this.stationForm.get('description'); }

  constructor(
    private modalController: ModalController,
    private toastService: ToastService,
    private fb: FormBuilder,
    private loadingService: LoadingService,
    private musicService: MusicService,
    private localDbService: LocalDbService,
    private router: Router
  ) { }

  ngOnInit() {
    if(this.station) {
      this.stationName.setValue(this.station.name);
      this.stationDescription.setValue(this.station.description);
      this.musicArr = this.station.musics;
    }
  }

  doReorder(ev: Event) {
    const evType = ev as CustomEvent<ItemReorderEventDetail>;
    evType.detail.complete();
  }


  async openModal(music?: IMusic, pos?: number) {
    const modal = await this.modalController.create({
      component: AddMusicComponent,
      componentProps: {
        music,
        pos
      }
    });

    modal.present();

    modal.onDidDismiss()
      .then(({data}) => {
        const dataType = data as {music: IMusic, pos?: number};
        if(dataType) {
          if(dataType.pos !== undefined) {
            this.musicArr[dataType.pos] = dataType.music;
          } else {
            this.musicArr.push(dataType.music);
          }
        }
      });
  }

  deleteMusic(index: number) {
    this.musicArr = this.musicArr.filter((music, i) => i !== index);
  }

  async createStation() {
    if(this.stationFormValidate()) {

      this.loadingService.present('Subiendo canciones...');
      const stationID = uniqid();

      for (let index = 0; index < this.musicArr.length; index++) {
        const music = this.musicArr[index];
        try {
          const ref = await this.musicService.uploadMusic(music, stationID);
          music.downloadUrl = ref;
          music.id = index;
        } catch (error) {
          this.loadingService.dismiss();
          this.toastService.presentToast('Error de conexión', Colors.DANGER, 5000);
          break;
        }
      }

      const user = await this.localDbService.getLocalUser();

      const station: IStation = {
        name: this.stationName.value,
        description: this.stationDescription.value,
        inReproduction: 3,
        author: {
          id: user.id,
          userName: user.userName,
          phofileImage: {
            compressImage: ''
          }
        },
        musics: this.musicArr
      };

      await this.musicService.createStation(station, stationID);
      this.loadingService.dismiss();
      this.toastService.presentToast('Se ha creado la estación', Colors.SUCCESS);
      this.router.navigate(['radio/station/' + stationID]);
    }
  }

  stationFormValidate() {
    if(this.stationName?.errors?.required) {
      this.toastService.presentToast('El nombre de la estación es obligatorio', Colors.DANGER);
      return false;
    }

    if(this.stationName?.errors?.minlength){
      this.toastService.presentToast('El nombre de la canción debe de ser de 5 caracter mínimo', Colors.DANGER, 5000);
      return false;
    }

    if(this.stationDescription?.errors?.minlength){
      this.toastService.presentToast('La descripción de la estación es obligatorio', Colors.DANGER, 5000);
      return false;
    }

    if(this.stationDescription?.errors?.minlength){
      this.toastService.presentToast('La descripción de la canción debe de ser de 5 caracter mínimo', Colors.DANGER, 5000);
      return false;
    }

    return true;
  }
}
