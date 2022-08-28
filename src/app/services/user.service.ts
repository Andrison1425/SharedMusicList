import { IStation } from './../interfaces/station.interface';
import { FirestoreCollection } from './../enums/firestore-collection.enum';
import { IUser } from './../interfaces/user.interface';
import { LocalDbService } from './local-db.service';
import { Injectable } from '@angular/core';
import { collection, doc, Firestore, setDoc, updateDoc, arrayUnion, getDoc, DocumentReference, arrayRemove } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private localDbService: LocalDbService,
    private firestore: Firestore
  ) { /* */}

  createUser(user: IUser) {
    return new Promise<IUser>((resolve, rejeact) => {
      (async () => {
        try {
          const usersCollection = collection(this.firestore, FirestoreCollection.Users);
          const newUserDoc = doc(usersCollection, user.id);
          await setDoc(newUserDoc, user);
          const userData = await getDoc(newUserDoc);
          console.log( userData.data())
          await this.localDbService.setUserData(user.id, userData.data() as IUser);
          resolve(user);
        } catch (error) {
          rejeact(error);
        }
      })();
    });
  }

  addFavoriteStation(station: IStation) {
    const id = this.localDbService.user.id;
    const docRef = doc(this.firestore, FirestoreCollection.Users + '/' + id );
    updateDoc(docRef, {
      favoriteStations: arrayUnion(station.id)
    }).then(() => {
      this.localDbService.setStation(station.id, station, true);
      this.syncUser();
    });
  }

  async removeFavoriteStation(stationId: string) {
    const id = this.localDbService.user.id;
    const docRef = doc(this.firestore, FirestoreCollection.Users + '/' + id );
    
    await updateDoc(docRef, {
      favoriteStations: arrayRemove(stationId)
    });

    this.localDbService.removeFavoriteStation(stationId);
    this.syncUser();
  }

  syncUser() {
    const id = this.localDbService.user.id;
    const docRef = doc(this.firestore, FirestoreCollection.Users + '/' + id ) as DocumentReference<IUser>;
    getDoc(docRef)
      .then(resp => {
        this.localDbService.setUserData(id, resp.data());
      })
  }

  async getUser(id: string) {
    const docRef = doc(this.firestore, FirestoreCollection.Users + '/' + id ) as DocumentReference<IUser>;
    const userData = await getDoc(docRef);
    return userData.data();
  }

  async updateUser(id: string, updateData: Partial<IUser>) {
    const docRef = doc(this.firestore, FirestoreCollection.Users + '/' + id ) as DocumentReference<IUser>;
    await updateDoc(docRef, updateData);
    const localUserData = await this.localDbService.getLocalUser();
    const updatedUser = await  this.localDbService.setUserData(id, {...localUserData, ...updateData});
    return updatedUser;
  }
}
