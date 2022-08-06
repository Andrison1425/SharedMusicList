import { UserService } from './user.service';
import { compressUriImage } from 'src/app/utils/utils';
import { FirebaseStorageRoute } from './../enums/firebase-storage-route.enum';
import { ImageCropperModalComponent } from './../components/image-cropper-modal/image-cropper-modal.component';
import { ModalController } from '@ionic/angular';
import { Subject, Subscription } from 'rxjs';
import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ref, uploadString, getStorage } from '@angular/fire/storage';
import * as uniqid from 'uniqid';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  base64Data$ = new Subject<string>();
  cropperImage$ = new Subject<string>();
  cropperSubscribe: Subscription;

  constructor(
    private modal: ModalController,
    private userService: UserService
  ) { /** */}

  async selectAndCroppImage(source: CameraSource){
    if (this.cropperSubscribe){
      this.cropperSubscribe.unsubscribe();
    }

    const cameraPhoto = await Camera.getPhoto({
      quality: 50,
      resultType: CameraResultType.DataUrl,
      source,
    });

    this.modal.create({
      component: ImageCropperModalComponent,
      componentProps: {
        register: true,
        base64: cameraPhoto.dataUrl
      }
    }).then(modal => modal.present());

    const cropperData: string = await new Promise((resolve) => {
      this.cropperSubscribe = this.getCropperImage()
      .subscribe((resp: string) => {
        resolve(resp);
      });
    });

    return cropperData;
  }

  getCropperImage(){
    return this.cropperImage$.asObservable();
  }

  async uploadProfileImage(image: string, userId: string, localUrl: string, registerPage = false) {
    const refUrl = `${userId}/${FirebaseStorageRoute.UserImages + uniqid()}.jpeg`;
    const locationRef = ref(getStorage(), 'refUrl');

    const compressImg = await compressUriImage(image);

    if (!registerPage) {
      await uploadString(locationRef, image, 'data_url');
      this.userService.updateUser(userId, {
        profileImage: {
          imageUrl: refUrl,
          imageLocalPath: localUrl,
          compressImage: compressImg
        }
      });
    } else {
      await uploadString(locationRef, image, 'data_url');
    }

    return refUrl;
  }

  async uploadStationImage(image: string, stationId: string) {
    const path = `${stationId}/${uniqid()}.jpeg`;
    const locationRef = ref(getStorage(), 'refUrl');

    const compress = await compressUriImage(image);

    await uploadString(locationRef, image, 'data_url');

    return {path, compress};
  }
}
