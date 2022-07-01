import { IUser } from 'src/app/interfaces/user.interface';
import { Folder } from './../../../enums/folder.enum';
import { FileSystemService } from './../../../services/file-system.service';
import { CameraSource } from '@capacitor/camera';
import { ImageService } from './../../../services/image.service';
import { Router } from '@angular/router';
import { LoadingService } from './../../../services/loading.service';
import { UserService } from './../../../services/user.service';
import { ToastService } from './../../../services/toast.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Colors } from 'src/app/enums/color.enum';
import { Auth } from '@angular/fire/auth';
import { ActionSheetController } from '@ionic/angular';
import { compressUriImage } from 'src/app/utils/utils';


@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  profileImgPath = '';

  userDataForm: FormGroup = this.fb.group({
    userName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
  });

  compressImg = '';
  get userName() { return this.userDataForm.get('userName'); }

  constructor(
    private fb: FormBuilder,
    private toastService: ToastService,
    private router: Router,
    private userService: UserService,
    private loading: LoadingService,
    private auth: Auth,
    private actionSheetController: ActionSheetController,
    private imageService: ImageService,
    private fileSystemService: FileSystemService
  ) { }

  ngOnInit() {
    //
  }

  async completeUserRegister() {

    const user: IUser = {
      id: this.auth.currentUser.uid,
      userName: this.userName.value,
      favoriteStations: [],
      profileImage: {
        compressImage: this.compressImg,
        imageLocalPath: '',
        imageUrl: ''
      },
      location: {
        country: '',
        countryCode: ''
      }
    }

    if (this.formValidate()) {
      this.loading.present('Creando usuario...');

      const fetchResult = await fetch('http://ip-api.com/json/');
      const data = await fetchResult.json();

      user.location = {
        country: data.country,
        countryCode: data.countryCode
      }

      if (this.profileImgPath) {
        const fileName = new Date().getTime() + '.jpeg';
        const localImg = await this.fileSystemService.writeFile(this.profileImgPath, fileName, Folder.ProfileImage);

        if (localImg) {
          this.imageService.uploadProfileImage(this.profileImgPath, this.auth.currentUser.uid, localImg, true)
            .then(urlImage => {
              user.profileImage.imageLocalPath = localImg;
              user.profileImage.imageUrl = urlImage;
              this.createUser(user);
            }).catch(() => {
              this.loading.dismiss();
              this.toastService.presentToast('Error al tratar de guardar la imágen', Colors.DANGER, 5000);
            });
        }
      } else {
        this.createUser(user);
      }
    }
  }

  createUser(user: IUser) {
    this.userService.createUser(user).then(() => {
      this.loading.dismiss();
      this.router.navigate(['radio/']);
    }).catch(() => {
      this.loading.dismiss();
      this.toastService.presentToast('Ha ocurrido un error', Colors.DANGER);
    });
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      cssClass: 'my-custom-class',
      buttons: [
        {
          text: 'Cámara',
          icon: 'camera-sharp',
          handler: () => {
            this.imageService.selectAndCroppImage(CameraSource.Camera)
              .then(resp => this.processImageSelected(resp));
          }
        },
        {
          text: 'Galería',
          icon: 'image-sharp',
          handler: () => {
            this.imageService.selectAndCroppImage(CameraSource.Photos)
              .then(resp => this.processImageSelected(resp));
          }
        },
        {
          text: 'Quitar imágen',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.compressImg = '';
            this.profileImgPath = '';
          }
        }
      ]
    });
    await actionSheet.present();
  }

  async processImageSelected(img: string) {
    this.profileImgPath = img;
    this.compressImg = await compressUriImage(img);
  }

  formValidate() {
    if (this.userName?.errors?.required) {
      this.toastService.presentToast('El nombre de usuario es obligatorio.', Colors.DANGER);
      return false;
    }

    if (this.userName?.errors?.minlength) {
      this.toastService.presentToast('El nombre de usuario debe de ser de 3 caracteres mínimo.', Colors.DANGER, 5000);
      return false;
    }

    return true;
  }
}
