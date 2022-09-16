import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { parseUrl } from 'query-string';
import { environment } from 'src/environments/environment.prod';
import { Deeplink } from '../enums/deeplink.enum';

@Injectable({
  providedIn: 'root'
})
export class DeepLinkService {

  constructor(
    private router: Router
  ) { }

  async initialize() {

    App.addListener('appUrlOpen', (e: URLOpenListenerEvent) => {
      const { url, query:{ id }} = parseUrl(e.url);
      console.log(url, environment.deeplinkBase + Deeplink.PLAYLIST)
      if (url && (url + '?id=') === environment.deeplinkBase + Deeplink.PLAYLIST) {
        this.goStation(id as string)
      }
    })
  }

  private goStation(id: string) {
    this.router.navigate(['radio/station/' + id]);
  }
}
