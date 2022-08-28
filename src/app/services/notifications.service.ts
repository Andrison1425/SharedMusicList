import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { PushNotifications } from '@capacitor/push-notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  constructor(
    private platform: Platform
  ) { }

  initialize() {
    if (this.platform.is('capacitor')) {
      PushNotifications.requestPermissions().then(result => {
        if (result.receive === 'granted') {
          // Register with Apple / Google to receive push via APNS/FCM
          console.log(result)
          PushNotifications.register();
        } else {
          // Show some error
        }
      });
    }
  }
}
