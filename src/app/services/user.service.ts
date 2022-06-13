import { FirestoreCollection } from './../enums/firestore-collection.enum';
import { IUser } from './../interfaces/user.interface';
import { LocalDbService } from './local-db.service';
import { Injectable } from '@angular/core';
import { collection, doc, Firestore, setDoc } from '@angular/fire/firestore';

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
          await this.localDbService.setUserData(user.id, user);
          resolve(user);
        } catch (error) {
          rejeact(error);
        }
      })();
    });
  }

  updateUser(user: IUser) {
    this.localDbService.setUserData(user.id, user);
  }

}
