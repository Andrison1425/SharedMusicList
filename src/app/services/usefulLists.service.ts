import { Injectable } from '@angular/core';
import { addDoc, arrayUnion, collection, doc, DocumentReference, Firestore, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { FirestoreCollection } from '../enums/firestore-collection.enum';
import { LocalDbService } from './local-db.service';

@Injectable({
  providedIn: 'root'
})
export class UsefulListsService {

  constructor(
    private localDbService: LocalDbService,
    private firestore: Firestore
  ) { }

  async getArtists() {
    const docRef = doc(this.firestore, FirestoreCollection.UsefulLists + '/artists') as DocumentReference<{
      artists: string[]
    }>;

    const artists = await getDoc(docRef);
    console.log(artists.data().artists)
    this.localDbService.setArtists(artists.data().artists);
    return artists.data().artists;
  }

  async addUnapprovedArtists(artist: string[]) {
    const docRef = doc(this.firestore, FirestoreCollection.UsefulLists + '/unapprovedArtists') as DocumentReference<{
      unapprovedArtists: string[]
    }>;

    await updateDoc(docRef, {
      unapprovedArtists: arrayUnion(...artist)
    })
  }

}
