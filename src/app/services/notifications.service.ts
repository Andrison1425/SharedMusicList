import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { PushNotifications } from '@capacitor/push-notifications';
import { collection, CollectionReference, doc, Firestore, onSnapshot, orderBy, query, where } from '@angular/fire/firestore';
import { FirestoreCollection } from '../enums/firestore-collection.enum';
import { INotification } from '../interfaces/notification.interface';
import { Observable, ReplaySubject } from 'rxjs';
import { LocalDbService } from './local-db.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  private token = '';
  private myNotifications$ = new ReplaySubject<INotification[]>(1);

  constructor(
    private platform: Platform,
    private firestore: Firestore,
    private localDbService: LocalDbService
  ) { }

  async initialize() {
    PushNotifications.addListener('registration', token => {
      this.token = token.value;
      this.getMyNotifications();
    });

    let permStatus = await PushNotifications.checkPermissions();
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

  private getMyNotifications() {
    const queryRef = query<INotification>(
      collection(this.firestore, FirestoreCollection.Notifications) as CollectionReference<INotification>,
      where('tokens', 'array-contains', this.token),
      orderBy('timestamp', 'desc')
    );

    onSnapshot(queryRef, (querySnapshot) => {
      const notifications:INotification[] = [];

      querySnapshot.forEach((notification) => {
        notifications.push({
          ...notification.data(),
          id: notification.id
        });
      });

      this.myNotifications$.next(notifications);
    });
  }

  getNotifications(): Observable<INotification[]> {
    return this.myNotifications$.asObservable()
  }

  getStationImage() {
    
  }
}
