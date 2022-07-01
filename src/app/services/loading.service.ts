import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  isLoading = false;
  loader: HTMLIonLoadingElement;

  constructor(
    private loadingController: LoadingController
  ) { }

  async present(message = '') {
    this.isLoading = true;
    return await this.loadingController.create({
      message,
    })
      .then(resp => {
        this.loader = resp;
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

  setContent(text: string) {
    if (this.loader) {
      this.loader.message = text;
    }
  }
}
