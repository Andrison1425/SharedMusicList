import { Folder } from './../../../enums/folder.enum';
import { FileSystemService } from './../../../services/file-system.service';
import { CameraSource } from '@capacitor/camera';
import { ImageService } from './../../../services/image.service';
import { PlaylistService } from '../../../services/playlist.service';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalDbService } from './../../../services/local-db.service';
import { MusicService } from './../../../services/music.service';
import { LoadingService } from './../../../services/loading.service';
import { Colors } from 'src/app/enums/color.enum';
import { FormBuilder, Validators } from '@angular/forms';
import { IPlaylist } from '../../../interfaces/playlist.interface';
import { AddMusicComponent } from './../../../components/add-music/add-music.component';
import { IMusic } from './../../../interfaces/music.interface';
import { ToastService } from './../../../services/toast.service';
import { ModalController, ItemReorderEventDetail, ActionSheetController, IonInput, AlertController, IonModal } from '@ionic/angular';
import { Route } from 'src/app/enums/route.enum';
import { Component, OnInit, ViewChild } from '@angular/core';
import * as uniqid from 'uniqid';
import { Timestamp, serverTimestamp } from '@angular/fire/firestore';
import * as Tagify from '@yaireo/tagify'
import { UsefulListsService } from 'src/app/services/usefulLists.service';
import { FileExplorerComponent } from 'src/app/components/file-explorer/file-explorer.component';
import { PlaylistType } from 'src/app/enums/playlist-type.enum';
import { FileInfo, Filesystem } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-create-station',
  templateUrl: './create-station.page.html',
  styleUrls: ['./create-station.page.scss'],
})
export class CreateStationPage implements OnInit {

  Routes = Route;
  musicArr: IMusic[] = [];
  playlist: IPlaylist;
  stationID: string;
  tagify: Tagify;
  artists: string[] = [];
  lastArtist: string = '';
  trackListArtists: string[] = [];
  playlistType: PlaylistType = PlaylistType.PUBLIC;
  disabledSelectType = false;
  imageStation = '../../../../assets/img/no-image.png';
  @ViewChild('tagInput', { static: false }) tagInput: IonInput;
  @ViewChild('playlistTypeModal') playlistTypeModal: IonModal;
  playlistTypeEnum = PlaylistType;

  stationForm = this.fb.group({
    name: ['', [Validators.required, Validators.min(5), Validators.max(40)]],
    description: ['', [Validators.required, Validators.min(5), Validators.max(200)]]
  });
  get stationName() { return this.stationForm.get('name'); }
  get stationDescription() { return this.stationForm.get('description'); }

  constructor(
    private modalController: ModalController,
    private multipleSelectController: ModalController,
    private toastService: ToastService,
    private fb: FormBuilder,
    private loadingService: LoadingService,
    private musicService: MusicService,
    private playlistService: PlaylistService,
    private localDbService: LocalDbService,
    private router: Router,
    private actionSheetController: ActionSheetController,
    private imageService: ImageService,
    private fileSystemService: FileSystemService,
    private route: ActivatedRoute,
    private usefulListsService: UsefulListsService,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.stationID = this.route.snapshot.paramMap.get('id');
    this.route.queryParams
      .subscribe(params => {
        if(params.type) {
          this.playlistType = params.type;
          this.disabledSelectType = true;
        }
      });
    if(this.stationID) {
      this.loadingService.present("Cargando Lista de reproducción");
      this.disabledSelectType = true;
      if (this.playlistType === PlaylistType.PRIVATE) {
        this.localDbService.getStation(this.stationID)
          .then(resp => {
            this.loadingService.dismiss();
            this.setPlaylistInfo(resp);
          })
          .catch(e => {
            console.log(e);
            this.loadingService.dismiss();
            this.toastService.presentToast('Lista de reproducción no encontrada', Colors.DANGER, 2000);
            this.router.navigate(['radio/'], {replaceUrl: true});
          })
      } else {
        this.playlistService.getStation(this.stationID)
          .then(resp => {
            this.loadingService.dismiss();
            this.setPlaylistInfo(resp);
          })
          .catch(e => {
            console.log(e);
            this.loadingService.dismiss();
            this.toastService.presentToast('Lista de reproducción no encontrada', Colors.DANGER, 2000);
            this.router.navigate(['radio/'], {replaceUrl: true});
          })
      }
    }

    const interval = setInterval(() => {
      if (this.tagInput) {
        this.createTagify();
        clearInterval(interval)
      }
    }, 200)

    this.getAllArtists();
  }

  setPlaylistInfo(playlist: IPlaylist) {
    this.playlist = playlist;
    this.stationName.setValue(this.playlist.name);
    this.stationDescription.setValue(this.playlist.description);
    this.musicArr = this.playlist.musics;
    this.musicArr.forEach(track => {
      if (this.trackListArtists.indexOf(track.artist) === -1) {
        this.trackListArtists.push(track.artist)
      }
    });
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
        pos,
        artists: [...this.trackListArtists, ...this.artists],
        lastArtist: this.lastArtist
      }
    });

    modal.present();

    modal.onDidDismiss()
      .then(({data}) => {
        const dataType = data as {music: IMusic, pos?: number};
        if(dataType) {
          if (this.trackListArtists.indexOf(dataType.music.artist) === -1) {
            this.trackListArtists.push(dataType.music.artist)
          }
          this.lastArtist = dataType.music.artist;
          if(dataType.pos !== undefined) {
            this.musicArr[dataType.pos] = dataType.music;
          } else {
            this.musicArr.push(dataType.music);
          }
        }
      });
  }

  async selectMusicsModal() {
    const modal = await this.multipleSelectController.create({
      component: FileExplorerComponent,
      componentProps: {
        musics: this.musicArr
      }
    });

    modal.present();

    modal.onDidDismiss()
      .then(async ({data}) => {
        if (!data.cancel) {
          const musics: FileInfo[] = data.musics;
          const arrTmp: IMusic[] = [];
          for (let index = 0; index < musics.length; index++) {
            const musicTmp = musics[index];
            const findMusic = this.musicArr.find(ele => ele.localPath === musicTmp.uri);
            if (findMusic) {
              arrTmp.push(findMusic);
              continue;
            }
            
            const fileData = await Filesystem.readFile({
              path: musicTmp.uri
            })
  
            const base64Length = fileData.data.length - (fileData.data.indexOf(',') + 1);
            const padding = (fileData.data.charAt(fileData.data.length - 2) === '=') ? 2 : ((fileData.data.charAt(fileData.data.length - 1) === '=') ? 1 : 0);
            const size = base64Length * 0.75 - padding;
  
            const music: IMusic = {
                title: musicTmp.name,
                artist: 'Desconocido',
                unapprovedArtists: false,
                localData: fileData.data,
                localPath: musicTmp.uri,
                local: {
                  isNew: false
                },
                size: size,
                downloadUrl: '',
                id: uniqid(),
                duration: await this.getDuration(Capacitor.convertFileSrc(musicTmp.uri)),
                stationId: ''
            }
  
            arrTmp.push(music);
          }
  
          this.musicArr = arrTmp;
        }
      });
  }

  getDuration(src: string): Promise<number> {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        resolve(audio.duration);
      }
      audio.src = src;
    });
  }

  changePlaylistType(type: PlaylistType) {
    this.playlistType = type;
    this.playlistTypeModal.dismiss();
  }

  deleteMusic(index: number) {
    this.musicArr = this.musicArr.filter((music, i) => i !== index);
  }

  async createStation(savedMusics: boolean) {
    if(this.stationFormValidate()) {
      this.loadingService.present('Subiendo canciones 1/' + this.musicArr.length);
      const stationID = this.playlist?.id || uniqid();

      for (let index = 0; index < this.musicArr.length; index++) {
        const music = this.musicArr[index];

        if (music.downloadUrl) {
          this.loadingService.setContent(`Subiendo canciones ${index+2}/${this.musicArr.length}`);
          continue;
        }

        try {
          music.id = uniqid();
          const {downloadUrl, localPath} = await this.musicService.uploadMusic(music, stationID, this.stationName.value, savedMusics);
          music.downloadUrl = downloadUrl;
          music.localPath = localPath;
          music.stationId = stationID;
          music.localData = '';
          this.loadingService.setContent(`Subiendo canciones ${index+2}/${this.musicArr.length}`);
        } catch (error) {
          this.loadingService.dismiss();
          this.toastService.presentToast('Error de conexión', Colors.DANGER, 5000);
          break;
        }
      }
      this.loadingService.setContent(this.playlist?.id? 'Actualizando lista de reproducción': 'Creando lista de reproducción...');

      const artistsName = new Set(this.musicArr.map(track => track.artist))

      await this.usefulListsService.addUnapprovedArtists([...artistsName]);

      const user = await this.localDbService.getLocalUser();

      const station: IPlaylist = {
        id: this.playlist?.id || stationID,
        name: this.stationName.value,
        description: this.stationDescription.value,
        type: PlaylistType.PUBLIC,
        artistsName: [...artistsName],
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

      this.playlistService.createOrUpdateStation(station, stationID, (this.playlist? true: false))
        .then(() => {
          this.loadingService.dismiss();
          this.toastService.presentToast('Se ha creado la lista de reproducción', Colors.SUCCESS);
          this.router.navigate(['radio/station/' + stationID], {replaceUrl: true});
        })
        .catch((e) => {
          console.log(station)
          console.log(e)
          this.loadingService.dismiss();
          this.toastService.presentToast('Error al tratar de crear la lista de reproducción', Colors.DANGER);
        })
    }
  }

  async createPrivateStation() {
    if(this.stationFormValidate()) {
      this.loadingService.present('Agregando canciones 1/' + this.musicArr.length);
      const stationID = this.playlist?.id || uniqid();

      let continueTask = true;

      for (let index = 0; index < this.musicArr.length; index++) {
        const music = this.musicArr[index];
        console.log(music);

        if (!music.localData) {
          this.loadingService.setContent(`Agregando canciones ${index+2}/${this.musicArr.length}`);
          continue;
        }

        try {
          music.id = uniqid();
          music.stationId = stationID;
          console.log(music);
          const localPath = await this.fileSystemService.writeFile(music.localData, `${music.title + '--' + music.id}.mp3`, `${Folder.Tracks + this.stationName.value}/`);
          music.localPath = localPath;
          music.localData = '';
          this.loadingService.setContent(`Agregando canciones ${index+2}/${this.musicArr.length}`);
        } catch (error) {
          this.loadingService.dismiss();
          this.toastService.presentToast('Error de conexión', Colors.DANGER, 5000);
          continueTask = false;
          break;
        }
      }

      if (continueTask) {
        this.loadingService.setContent(this.playlist?.id? 'Actualizando lista de reproducción': 'Creando lista de reproducción...');
  
        const artistsName = this.musicArr.map(track => track.artist);
        const user = await this.localDbService.getLocalUser();
  
        if (this.playlist) {
          for (let index = 0; index < this.playlist.musics.length; index++) {
            const track = this.playlist.musics[index];
            const tracksID = this.musicArr.map(ele => ele.id);

            if (!tracksID.includes(track.id)) {
              try {
                await this.fileSystemService.deleteFile(track.localPath);
              } catch (error) {
                continue;
              }
            }
          }
        }

        const station: IPlaylist = {
          id: this.playlist?.id || stationID,
          name: this.stationName.value,
          description: this.stationDescription.value,
          type: PlaylistType.PRIVATE,
          artistsName: artistsName,
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
  
        this.localDbService.setStation(stationID, station)
          .then(() => {
            this.loadingService.dismiss();
            this.toastService.presentToast('Se ha creado la lista de reproducción', Colors.SUCCESS);
            this.router.navigate(['radio/station/' + stationID], {replaceUrl: true});
          })
          .catch((e) => {
            console.log(e)
            this.loadingService.dismiss();
            this.toastService.presentToast('Error al tratar de crear la lista de reproducción', Colors.DANGER);
          })
      }
    }
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
          this.tagify = new Tagify(input, {
          
          })
        })
    }
  }

  getTags() {
    return this.tagify.value.map(tag => tag.value)
  }

  async getAllArtists() {
    this.artists = await this.localDbService.getArtists();
    if (!this.artists) {
      this.artists = await this.usefulListsService.getArtists();
    } else {
      this.usefulListsService.getArtists()
        .then(resp => this.artists = resp);
    }
  }

  deleteAll() {
    this.musicArr = [];
  }

  async confirmDelete() {
    const alert = await this.alertController.create({
      header: 'Eliminar todo!',
      message: 'Seguro de que deseas eliminar todas las canciones?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'confirm',
          handler: () => {
            this.deleteAll()
          },
        },
      ],
    });

    await alert.present();

    await alert.onDidDismiss();
  }

  async confirmCreateOrEdit() {
    const alert = await this.alertController.create({
      header: this.playlist?.id? 'Editar lista de reproducción': 'Crear lista de reproducción',
      message: this.playlistType === this.playlistTypeEnum.PUBLIC? 
        'Si marcas la siguiente casilla podrás reproducir las canciones que agregaste con o sin conexión a internet':
        ''
      ,
      inputs: this.playlistType === this.playlistTypeEnum.PUBLIC? [
        {
          label: 'Guardar localmente',
          type: 'checkbox',
          name: 'savedMusics',
          id: 'savedMusics'
        }
      ] : [],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Continuar',
          role: 'confirm',
          handler: (data) => {
            this.playlistType === this.playlistTypeEnum.PUBLIC
              ? this.createStation(data.length>0? true: false)
              : this.createPrivateStation()
          },
        },
      ],
    });

    await alert.present();

    await alert.onDidDismiss();
  }

  trackByFn(index: number, music: IMusic) {
    return music.id || index;
  }
}
