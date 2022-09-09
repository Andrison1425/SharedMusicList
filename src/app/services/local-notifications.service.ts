import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { IMusic } from '../interfaces/music.interface';
import { DownloadService } from './download.service';

@Injectable({
  providedIn: 'root'
})
export class LocalNotificationsService {

  nextNotificationID = 0;
  
  constructor(
    private downloadService: DownloadService
  ) { }

  async initialize() {
    await LocalNotifications.requestPermissions();

    LocalNotifications
      .addListener('localNotificationActionPerformed', async (action) => {
        this.downloadService.showDownloadsModal();
      });
  }

  async downloadNotification(music: IMusic) {
    await LocalNotifications.schedule({
      notifications: [{
        title: 'Descargando canción...',
        body: `${music.title} - ${music.artist}`,
        id: this.nextNotificationID,
        extra: {
          musicId: music.id
        },
        iconColor: '#A52502'
      }]
    });

    this.downloadService.downloadMusic(music);

    this.nextNotificationID++;
  }
}
