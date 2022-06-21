import { FileSystemService } from './../../../services/file-system.service';
import { Folder } from './../../../enums/folder.enum';
import { CameraSource } from '@capacitor/camera';
import { ImageService } from './../../../services/image.service';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { StationService } from './../../../services/station.service';
import { UserService } from './../../../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { IStation } from './../../../interfaces/station.interface';
import { LocalDbService } from './../../../services/local-db.service';
import { IUser } from './../../../interfaces/user.interface';
import { Component, OnInit } from '@angular/core';
import { Route } from 'src/app/enums/route.enum';

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
  stations: IStation[] = [];
  imgPath = '../../../assets/img/person.jpg';

  constructor(
    private localDbService: LocalDbService,
    private route: ActivatedRoute,
    private userService: UserService,
    private stationService: StationService,
    private actionSheetController: ActionSheetController,
    private imageService: ImageService,
    private fileSystemService: FileSystemService,
    private alertController: AlertController
  ) { /**/}

  ngOnInit() {
    this.userID = this.route.snapshot.paramMap.get('id');

    if (this.userID) {
      this.userService.getUser(this.userID)
        .then(user => {
          this.user = user;
          if (user.profileImage.compressImage) {
            this.imgPath = user.profileImage.compressImage;
          }
          this.stationService.getStationsForUser(user.id)
            .then(stations => {
              this.stations = stations;
            })
        });
    } else {
      this.localDbService.getLocalUser()
        .then(resp => {
          this.user = resp;
          if (resp.profileImage.imageLocalPath) {
            this.imgPath = Capacitor.convertFileSrc(resp.profileImage.imageLocalPath);
          }
          this.localDbService.getMyStations(this.user.id)
            .then(stations => {
              this.stations = stations
              let likesCount = 0;
              let dislikesCount = 0;
              stations.forEach(station => {
                likesCount += station.reactions.numLikes;
                dislikesCount += station.reactions.numLikes;
              });

              this.reactionsCount = {
                dislikes: dislikesCount,
                likes: likesCount
              }
            });
        });

      this.localDbService.userData()
        .subscribe(resp => {
          console.log(resp)
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
          text: 'Apodo',
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
          handler: () => {
            const newUserName = document.querySelector('#apodoTxt') as HTMLInputElement;
            if (this.user.userName !== newUserName.value && newUserName.value.trim() !== '') {
              this.user.userName = newUserName.value;
              this.userService.updateUser(this.user.id, {
                userName: newUserName.value
              });
            }
          }
        }
      ],
      inputs: [
        {
          name: 'apodoTxt',
          id: 'apodoTxt',
          type: 'text',
          max: 80,
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

}
