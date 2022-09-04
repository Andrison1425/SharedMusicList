import { Injectable } from '@angular/core';
import { arrayRemove, arrayUnion, doc, Firestore, setDoc, updateDoc } from '@angular/fire/firestore';
import { FirestoreCollection } from '../enums/firestore-collection.enum';

@Injectable({
  providedIn: 'root'
})
export class NotificationTokensService {

  constructor(
    private firestore: Firestore
  ) { }

  async addTokenInMusicList (musicListId: string, token: string) {
    const docRef = doc(this.firestore, FirestoreCollection.MusicListUserTokens + '/' + musicListId);
    await updateDoc(docRef, {
      'userTokens': arrayUnion(token)
    }).catch(e => console.log(e));

    return;
  }

  async deleteTokenInMusicList (musicListId: string, token: string) {
    const docRef = doc(this.firestore, FirestoreCollection.MusicListUserTokens + '/' + musicListId);
    await setDoc(docRef, {
      'userTokens': arrayRemove(token)
    });

    return;
  }
}
