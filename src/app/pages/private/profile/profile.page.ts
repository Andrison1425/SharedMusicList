import { FileSystemService } from './../../../services/file-system.service';
import { Folder } from './../../../enums/folder.enum';
import { CameraSource } from '@capacitor/camera';
import { ImageService } from './../../../services/image.service';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { PlaylistService } from '../../../services/playlist.service';
import { UserService } from './../../../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { IPlaylist } from '../../../interfaces/playlist.interface';
import { LocalDbService } from './../../../services/local-db.service';
import { IUser } from './../../../interfaces/user.interface';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Route } from 'src/app/enums/route.enum';
import getUnicodeFlagIcon from 'country-flag-icons/unicode'
import { PlaylistType } from 'src/app/enums/playlist-type.enum';
import { ToastService } from 'src/app/services/toast.service';
import { Colors } from 'src/app/enums/color.enum';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  Routes = Route;
  userID: string;
  user: IUser;
  reactionsCount = {
    likes: 0,
    dislikes: 0
  }
  isModalCreateStatioOpen = false;
  stations: IPlaylist[] = [];
  imgPath = '../../../assets/img/person.jpg';
  activeTab = 'LISTS';
  createDate: string = '';
  views = 0;
  
  constructor(
    private localDbService: LocalDbService,
    private route: ActivatedRoute,
    private userService: UserService,
    private playlistService: PlaylistService,
    private actionSheetController: ActionSheetController,
    private imageService: ImageService,
    private fileSystemService: FileSystemService,
    private alertController: AlertController,
    private toastService: ToastService
  ) { /**/}

  ngOnInit() {
    this.userID = this.route.snapshot.paramMap.get('id');

    if (this.userID) {
      this.userService.getUser(this.userID)
        .then(user => {
          this.user = user;
          this.createDate = String(new Date(user.createDate.seconds * 1000));
          if (user.profileImage.compressImage) {
            this.imgPath = user.profileImage.compressImage;
          }
          this.playlistService.getStationsForUser(user.id)
            .then(stations => {
              this.stations = stations;
            })
        });
    } else {
      this.localDbService.getLocalUser()
        .then(resp => {
          this.user = resp;
          this.createDate = String(new Date(resp.createDate.seconds * 1000));
          if (resp.profileImage.imageLocalPath) {
            this.imgPath = Capacitor.convertFileSrc(resp.profileImage.imageLocalPath);
          }
          this.localDbService.getMyPlaylists(this.user.id)
            .then(stations => {
              this.stations = stations.filter(playlist => playlist.type !== PlaylistType.PRIVATE)
              let likesCount = 0;
              let dislikesCount = 0;
              let views = 0;
              stations.forEach(station => {
                likesCount += station.reactions.numLikes;
                dislikesCount += station.reactions.numLikes;
                views += station.views;
              });

              this.reactionsCount = {
                dislikes: dislikesCount,
                likes: likesCount
              }

              this.views = views;
            });
        });

      this.localDbService.userData()
        .subscribe(resp => {
          this.user = resp;
          if (resp.profileImage.imageLocalPath) {
            this.imgPath = Capacitor.convertFileSrc(resp.profileImage.imageLocalPath);
          }
        });
    }
  }

  onDeleteStation(id: string) {
    this.stations = this.stations.filter(station => station.id !== id);
  }

  async editActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      cssClass: 'my-custom-class',
      header: 'Editar',
      buttons: [
        {
          text: 'Nombre de usuario',
          icon: 'reader-sharp',
          handler: () => {
            this.changeUserName();
          }
        },
        {
          text: 'Imágen de perfil',
          icon: 'image-sharp',
          handler: () => {
            this.presentImageActionSheet();
          }
        }
      ]
    });
    await actionSheet.present();
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
              .then(resp => this.uploadImage(resp))
        },
        {
          text: 'Galería',
          icon: 'image-sharp',
          handler: () =>
            this.imageService.selectAndCroppImage(CameraSource.Photos)
              .then(resp => this.uploadImage(resp))
        },
        {
          text: 'Quitar imágen',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.imgPath = '';
          }
        }
      ]
    });
    await actionSheet.present();
  }

  async changeUserName() {
    const alert = await this.alertController.create({
      cssClass: 'alertDescription',
      message: 'Cambiar nombre de usuario',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Cambiar',
          handler: ({apodoTxt}) => {
            if (apodoTxt.trim().length < 3) {
              this.toastService.presentToast('El nombre de usuario debe tener 3 o más caracteres', Colors.DANGER, 3000);
              return false;
            } else {
              if (this.user.userName !== apodoTxt.trim()) {
                this.user.userName = apodoTxt;
                this.userService.updateUser(this.user.id, {
                  userName: apodoTxt
                });
              }
              return true;
            }
          }
        }
      ],
      inputs: [
        {
          name: 'apodoTxt',
          id: 'apodoTxt',
          type: 'text',
          attributes: {
            maxlength: 20,
            minlength: 3
          },
          max: 20,
          placeholder: 'Ingrea el nuevo nombre de usuario',
          value: this.user.userName
        }
      ]
    });

    await alert.present();
  }

  async uploadImage(image: string) {
    const fileName = new Date().getTime() + '.jpeg';
    const localImg = await this.fileSystemService.writeFile(image, fileName, Folder.ProfileImage);
    this.imageService.uploadProfileImage(image, this.user.id, localImg);
    this.imgPath = image;
  }

  segmentChanged(ev) {
    if (ev.detail.value === 'ABOUT') {
      this.activeTab = 'ABOUT';
    }else {
      this.activeTab = 'LISTS';
    }
  }

  getCountryFlag(countryCode: string) {
    return getUnicodeFlagIcon(countryCode || 'US');
  }
}
