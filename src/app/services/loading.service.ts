import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  isLoading = false;

  constructor(public loadingController: LoadingController) { }

  async present(message = '') {
    this.isLoading = true;
    return await this.loadingController.create({
      message
    })
      .then(resp => {
        resp.present().then(() => {
          if (!this.isLoading) {
            resp.dismiss();
          }
        });
      });
  }

  async dismiss() {
    this.isLoading = false;
    return await this.loadingController.dismiss();
  }
}
