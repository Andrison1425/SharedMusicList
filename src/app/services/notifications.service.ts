import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { PushNotifications } from '@capacitor/push-notifications';
import { doc, Firestore } from '@angular/fire/firestore';
import { FirestoreCollection } from '../enums/firestore-collection.enum';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  private token = '';

  constructor(
    private platform: Platform,
    private firestore: Firestore
  ) { }

  async initialize() {

    PushNotifications.addListener('registration', token => {
      console.log(token)
      this.token = token.value;
    });

    let permStatus = await PushNotifications.checkPermissions();
console.log(permStatus)
    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      throw new Error('User denied permissions!');
    }

    await PushNotifications.register();
  }

  get userToken(): string {
    return this.token;
  }

  addNotification() {
    const docRef = doc(this.firestore, FirestoreCollection.Notifications + '/');

  }
}
