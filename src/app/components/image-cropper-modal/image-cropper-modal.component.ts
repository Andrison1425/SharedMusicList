import { ImageService } from '../../services/image.service';
import { NavParams, ModalController } from '@ionic/angular';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';

@Component({
  selector: 'app-image-cropper-modal',
  templateUrl: './image-cropper-modal.component.html',
  styleUrls: ['./image-cropper-modal.component.scss'],
})
export class ImageCropperModalComponent implements OnInit {

  croppedImage = '';
  imageRegister: boolean;
  base64Image: string;
  @ViewChild(ImageCropperComponent, { static: false }) angularCropper: ImageCropperComponent;

  constructor(
    private navParams: NavParams,
    private modalController: ModalController,
    private imageService: ImageService
  ) { }

  ngOnInit() {
    this.base64Image = this.navParams.get('base64');
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }

  close() {
    this.modalController.dismiss();
  }

  save() {
    this.angularCropper.crop();
    this.imageService.cropperImage$.next(this.croppedImage);
    this.modalController.dismiss();
  }
}
