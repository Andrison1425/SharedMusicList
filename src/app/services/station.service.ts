import { StationOrderBy } from './../enums/station-order-by.enum';
import { Reaction } from './../enums/reaction.enum';
import { Injectable } from '@angular/core';
import { setDoc, Firestore, deleteDoc, doc, collection, orderBy, getDoc, getDocs, query, updateDoc, CollectionReference, increment, DocumentReference, where } from '@angular/fire/firestore';
import { FirestoreCollection } from './../enums/firestore-collection.enum';
import { IStation } from './../interfaces/station.interface';
import { LocalDbService } from './local-db.service';

@Injectable({
  providedIn: 'root'
})
export class StationService {

  constructor(
    private localDbService: LocalDbService,
    private firestore: Firestore
  ) { }

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

  async getStations(_orderBy: StationOrderBy) {
    let orderByField = '';
    if (_orderBy === StationOrderBy.Likes) {
      orderByField = 'reactions.numLikes';
    } else if (_orderBy === StationOrderBy.Recent) {
      orderByField = 'timestamp';
    } else {
      orderByField = 'views';
    }

    const queryRef = query<IStation>(
      collection(this.firestore, FirestoreCollection.Stations) as CollectionReference<IStation>,
      orderBy(orderByField, 'desc')
    );

    const docResp = await getDocs(queryRef);
    const stations = docResp.docs.map(resp => resp.data());
    return stations;
  }

  async getStation(id: string) {
    const docRef = doc(this.firestore, FirestoreCollection.Stations + '/' + id ) as DocumentReference<IStation>;
    const stationData = await getDoc(docRef);
    return stationData.data();
  }

  setReaction(stationId: string, userId: string, reaction: Reaction) {
    const docRef = doc(this.firestore, FirestoreCollection.Stations + '/' + stationId);
    const incrementRef = reaction === Reaction.Like? 'reactions.numLikes': 'reactions.numDislikes';
    updateDoc(docRef, {
      [incrementRef]: increment(1),
      [`reactions.idUsersAndReaction.${userId}`]: reaction
    });
  }

  syncStation(stationId: string) {
    return new Promise<IStation>((resolve, rejeact) => {
      (async () => {
        try {
          const docRef = doc(this.firestore, FirestoreCollection.Stations + '/' + stationId) as DocumentReference<IStation>;
          const stationData = await getDoc(docRef);
          const syncStation = await this.localDbService.setStation(stationId, stationData.data());
          resolve(syncStation);
        } catch (error) {
          rejeact(error);
        }
      })();
    });
  }

  addView(stationId: string) {
    const docRef = doc(this.firestore, FirestoreCollection.Stations + '/' + stationId);
    updateDoc(docRef, {
      views: increment(1)
    });
  }

  async getStationsForUser(userID: string) {
    const queryRef = query<IStation>(
      collection(this.firestore, FirestoreCollection.Stations) as CollectionReference<IStation>,
      where('author.id', '==', userID),
      orderBy('reactions.numLikes', 'asc')
    );

    const docResp = await getDocs(queryRef);
    const stations = docResp.docs.map(resp => resp.data());
    return stations;
  }
}
