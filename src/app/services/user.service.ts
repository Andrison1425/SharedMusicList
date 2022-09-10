import { IStation } from './../interfaces/station.interface';
import { FirestoreCollection } from './../enums/firestore-collection.enum';
import { IUser } from './../interfaces/user.interface';
import { LocalDbService } from './local-db.service';
import { Injectable } from '@angular/core';
import { collection, doc, Firestore, setDoc, updateDoc, arrayUnion, getDoc, DocumentReference, arrayRemove, query, CollectionReference, where, orderBy, getDocs } from '@angular/fire/firestore';
import { NotificationTokensService } from './notification-tokens.service';
import { NotificationsService } from './notifications.service';
import { StationService } from './station.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private localDbService: LocalDbService,
    private firestore: Firestore,
    private notificationTokensService: NotificationTokensService,
    private notificationsService: NotificationsService,
    private stationService: StationService
  ) { /* */}

  createUser(user: IUser) {
    return new Promise<IUser>((resolve, rejeact) => {
      (async () => {
        try {
          const usersCollection = collection(this.firestore, FirestoreCollection.Users);
          const newUserDoc = doc(usersCollection, user.id);
          await setDoc(newUserDoc, user);
          const userData = await getDoc(newUserDoc);
          await this.localDbService.setUserData(user.id, userData.data() as IUser);
          resolve(user);
        } catch (error) {
          rejeact(error);
        }
      })();
    });
  }

  async addFavoriteStation(station: IStation) {
    const id = this.localDbService.user.id;
    const docRef = doc(this.firestore, FirestoreCollection.Users + '/' + id );
    await updateDoc(docRef, {
      favoriteStations: arrayUnion(station.id)
    })
    await this.localDbService.setStation(station.id, station, true);
    await this.notificationTokensService.addTokenInMusicList(station.id, this.notificationsService.userToken);
    this.syncUser();
    return;
  }
  
  async removeFavoriteStation(stationId: string) {
    const id = this.localDbService.user.id;
    const docRef = doc(this.firestore, FirestoreCollection.Users + '/' + id );
    
    await updateDoc(docRef, {
      favoriteStations: arrayRemove(stationId)
    });

    await this.localDbService.removeFavoriteStation(stationId);
    await this.notificationTokensService.deleteTokenInMusicList(stationId, this.notificationsService.userToken);
    this.syncUser();
    return;
  }

  async syncFavoriteStations(user: IUser) {
    const queryRef = query<IStation>(
      collection(this.firestore, FirestoreCollection.Stations) as CollectionReference<IStation>,
      where('id', 'in', user.favoriteStations)
    );

    const docResp = await getDocs(queryRef);
    const stations = docResp.docs.map(resp => resp.data());

    return stations;
  }

  async syncUser(userID?: string) {
    const id = userID || this.localDbService.user.id;
    const docRef = doc(this.firestore, FirestoreCollection.Users + '/' + id ) as DocumentReference<IUser>;
    const userData = await getDoc(docRef);
    this.localDbService.setUserData(id, userData.data());
    const stations = await this.stationService.getStationsForUser(id);

    for (let index = 0; index < stations.length; index++) {
      const station = stations[index];
      await this.localDbService.setStation(station.id, station);
    }

    const favoriteStations =  await this.syncFavoriteStations(userData.data());

    for (let index = 0; index < favoriteStations.length; index++) {
      const station = favoriteStations[index];
      await this.localDbService.setStation(station.id, station);
    }

    return;
  }

  async getUser(id: string) {
    const docRef = doc(this.firestore, FirestoreCollection.Users + '/' + id ) as DocumentReference<IUser>;
    const userData = await getDoc(docRef);
    return userData?.data();
  }

  async updateUser(id: string, updateData: Partial<IUser>) {
    const docRef = doc(this.firestore, FirestoreCollection.Users + '/' + id ) as DocumentReference<IUser>;
    await updateDoc(docRef, updateData);
    const localUserData = await this.localDbService.getLocalUser();
    const updatedUser = await  this.localDbService.setUserData(id, {...localUserData, ...updateData});
    return updatedUser;
  }
}
