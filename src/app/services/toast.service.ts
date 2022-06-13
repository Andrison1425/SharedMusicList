import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Colors } from '../enums/color.enum';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(
    private toastController: ToastController
  ) { }

  async presentToast(text: string, color: Colors = Colors.LIGHT, duration = 3000) {
    const toast = await this.toastController.create({
      message: text,
      duration,
      position: 'top',
      color,
      buttons: [
        {
          text: 'x',
          role: 'cancel'
        }
      ]
    });
    toast.present();
  }
}
