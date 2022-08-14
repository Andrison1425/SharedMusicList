import { Folder } from './../../../enums/folder.enum';
import { FileSystemService } from './../../../services/file-system.service';
import { CameraSource } from '@capacitor/camera';
import { ImageService } from './../../../services/image.service';
import { StationService } from './../../../services/station.service';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalDbService } from './../../../services/local-db.service';
import { MusicService } from './../../../services/music.service';
import { LoadingService } from './../../../services/loading.service';
import { Colors } from 'src/app/enums/color.enum';
import { FormBuilder, Validators } from '@angular/forms';
import { IStation } from './../../../interfaces/station.interface';
import { AddMusicComponent } from './../../../components/add-music/add-music.component';
import { IMusic } from './../../../interfaces/music.interface';
import { ToastService } from './../../../services/toast.service';
import { ModalController, ItemReorderEventDetail, ActionSheetController, IonInput } from '@ionic/angular';
import { Route } from 'src/app/enums/route.enum';
import { Component, OnInit, ViewChild } from '@angular/core';
import * as uniqid from 'uniqid';
import { Timestamp, serverTimestamp } from '@angular/fire/firestore';
import * as Tagify from '@yaireo/tagify'

@Component({
  selector: 'app-create-station',
  templateUrl: './create-station.page.html',
  styleUrls: ['./create-station.page.scss'],
})
export class CreateStationPage implements OnInit {

  Routes = Route;
  musicArr: IMusic[] = [];
  station: IStation;
  stationID: string;
  tagify: Tagify;
  imageStation = '../../../../assets/img/no-image.png';
  @ViewChild('tagInput', { static: false }) tagInput: IonInput;

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
    private stationService: StationService,
    private localDbService: LocalDbService,
    private router: Router,
    private actionSheetController: ActionSheetController,
    private imageService: ImageService,
    private fileSystemService: FileSystemService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.stationID = this.route.snapshot.paramMap.get('id');

    if(this.stationID) {
      this.localDbService.getStation(this.stationID)
        .then(resp => {
          this.station = resp;
          this.stationName.setValue(this.station.name);
          this.stationDescription.setValue(this.station.description);
          this.musicArr = this.station.musics;
        });
    }

    const interval = setInterval(() => {
      if (this.tagInput) {
        this.createTagify();
        clearInterval(interval)
      }
    }, 200)
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

      this.loadingService.present('Subiendo canciones 1/' + this.musicArr.length);
      const stationID = this.station?.id || uniqid();

      for (let index = 0; index < this.musicArr.length; index++) {
        const music = this.musicArr[index];

        if (music.id) {
          this.loadingService.setContent(`Subiendo canciones ${index+2}/${this.musicArr.length}`);
          continue;
        }

        try {
          const {downloadUrl, localPath} = await this.musicService.uploadMusic(music, stationID, this.stationName.value);
          music.downloadUrl = downloadUrl;
          music.localPath = localPath;
          music.id = uniqid();
          music.stationId= stationID;
          this.loadingService.setContent(`Subiendo canciones ${index+2}/${this.musicArr.length}`);
        } catch (error) {
          this.loadingService.dismiss();
          this.toastService.presentToast('Error de conexión', Colors.DANGER, 5000);
          break;
        }
      }
      this.loadingService.setContent(this.station?.id? 'Actualizando lista de reproducción': 'Creando lista de reproducción...');

      const user = await this.localDbService.getLocalUser();

      const station: IStation = {
        id: this.station?.id || stationID,
        name: this.stationName.value,
        description: this.stationDescription.value,
        inReproduction: 3,
        author: {
          id: user.id,
          userName: user.userName
        },
        image: await this.uploadImage(this.imageStation, stationID),
        musics: this.musicArr,
        views: 0,
        reactions: {
          idUsersAndReaction: {},
          numDislikes: 0,
          numLikes: 0
        },
        timestamp: serverTimestamp() as Timestamp,
        comments: [],
        tags: this.getTags()
      };

      this.stationService.createOrUpdateStation(station, stationID, (this.station? true: false))
        .then(() => {
          this.loadingService.dismiss();
          this.toastService.presentToast('Se ha creado la estación', Colors.SUCCESS);
          this.router.navigate(['radio/station/' + stationID], {replaceUrl: true});
        })
        .catch((e) => {
          console.log(e)
          this.loadingService.dismiss();
          this.toastService.presentToast('Error al tratar de crear la estación', Colors.DANGER);
        })
    }
  }

  async presentImageActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      cssClass: 'my-custom-class',
      buttons: [
        {
          text: 'Cámara',
          icon: 'camera-sharp',
          handler: () =>
            this.imageService.selectAndCroppImage(CameraSource.Camera)
              .then(resp => {this.imageStation = resp})
        },
        {
          text: 'Galería',
          icon: 'image-sharp',
          handler: () =>
            this.imageService.selectAndCroppImage(CameraSource.Photos)
              .then(resp => {this.imageStation = resp})
        },
        {
          text: 'Quitar imágen',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.imageStation = '../../../../assets/img/no-image.png';
          }
        }
      ]
    });
    await actionSheet.present();
  }

  async uploadImage(image: string, stationId: string) {
    if (this.imageStation === '../../../../assets/img/no-image.png') {
      return {
        compress: '',
        path: '',
        localPath: ''
      }
    } else {
      const fileName = new Date().getTime() + '.jpeg';
      const localPath = await this.fileSystemService.writeFile(image, fileName, Folder.StationImage);
      const imageData = await this.imageService.uploadStationImage(image, stationId);
      return {...imageData, localPath};
    }
  }

  stationFormValidate() {
    if(this.stationName?.errors?.required) {
      this.toastService.presentToast('El nombre de la lista es obligatorio', Colors.DANGER);
      return false;
    }

    if(this.stationName?.errors?.minlength){
      this.toastService.presentToast('El nombre de la lista debe de ser de mínimo 5 caracteres', Colors.DANGER, 4000);
      return false;
    }

    if(this.stationDescription?.errors?.minlength){
      this.toastService.presentToast('La descripción de la lista es obligatoria', Colors.DANGER, 4000);
      return false;
    }

    if(this.stationDescription?.errors?.minlength){
      this.toastService.presentToast('La descripción de la lista debe de ser de mínimo 5 caracteres', Colors.DANGER, 4000);
      return false;
    }

    if(this.getTags().length === 0){
      this.toastService.presentToast('Agrega al menos una etiqueta', Colors.DANGER, 4000);
      return false;
    }

    if(this.musicArr.length === 0){
      this.toastService.presentToast('Agrega al menos una canción', Colors.DANGER, 4000);
      return false;
    }

    return true;
  }

  createTagify() {
    if (!this.tagify) {
      this.tagInput.getInputElement()
        .then(input => {
          this.tagify = new Tagify(input)
        })
    }
  }

  getTags() {
    return this.tagify.value.map(tag => tag.value)
  }
}
