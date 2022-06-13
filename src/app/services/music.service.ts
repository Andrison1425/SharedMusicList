import { FirestoreCollection } from './../enums/firestore-collection.enum';
import { IStation } from './../interfaces/station.interface';
import { LocalDbService } from './local-db.service';
import { FirebaseStorageRoute } from './../enums/firebase-storage-route.enum';
import { IMusic } from './../interfaces/music.interface';
import { Injectable } from '@angular/core';
import { ref, uploadString, getStorage, getDownloadURL } from '@angular/fire/storage';
import { setDoc, Firestore, deleteDoc } from '@angular/fire/firestore';
import uniqid from 'uniqid';
import { doc } from '@firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class MusicService {

  constructor(
    private localDbService: LocalDbService,
    private firestore: Firestore
  ) {/** */ }

  async uploadMusic(music: IMusic, stationID: string) {
    return new Promise<string>((resolve, rejeact) => {
      (async () => {
        try {
          const locationRef = ref(
            getStorage(),
            `${FirebaseStorageRoute.Musics + stationID}/${uniqid()}.mp3`
          );

          const upload = await uploadString(locationRef, music.localData, 'data_url');
          const downloadUrl = await getDownloadURL(upload.ref);
          resolve(downloadUrl);
        } catch (error) {
          console.log(error)
          rejeact(error);
        }
      })();
    });
  }

  createStation(station: IStation, stationID: string) {
    return new Promise<string>((resolve, rejeact) => {
      (async () => {
        try {
          const docRef = doc(this.firestore, FirestoreCollection.Stations + '/' + stationID);
          await setDoc(docRef, {
            ...station,
            localData: ''
          });
          await this.localDbService.setStation(stationID, station);
          resolve(stationID);
        } catch (error) {
          rejeact(error);
        }
      })();
    });
  }

  async deleteStation(id: string) {
    return new Promise<void>((resolve, rejeact) => {
      (async () => {
        try {
          const docRef = doc(this.firestore, FirestoreCollection.Stations + '/' + id);
          await deleteDoc(docRef);
          this.localDbService.deleteStation(id);
          resolve();
        } catch (error) {
          rejeact(error);
        }
      })();
    });
  }
}
