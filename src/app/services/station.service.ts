import { getFakeTimestamp } from './../utils/utils';
import { IComment } from './../interfaces/comment.interface';
import { StationOrderBy } from './../enums/station-order-by.enum';
import { Reaction } from './../enums/reaction.enum';
import { Injectable } from '@angular/core';
import { serverTimestamp, setDoc, Firestore, deleteDoc, doc, collection, orderBy, getDoc, getDocs, query, updateDoc, CollectionReference, increment, DocumentReference, where, Timestamp, arrayRemove, arrayUnion } from '@angular/fire/firestore';
import { FirestoreCollection } from './../enums/firestore-collection.enum';
import { IStation } from './../interfaces/station.interface';
import { LocalDbService } from './local-db.service';
import { v4 as uuidv4 } from 'uuid';
import { IFilters } from '../interfaces/filters.interface';

@Injectable({
  providedIn: 'root'
})
export class StationService {

  constructor(
    private localDbService: LocalDbService,
    private firestore: Firestore
  ) { }

  createOrUpdateStation(station: IStation, stationID: string, update?: boolean) {
    return new Promise<string>((resolve, rejeact) => {
      (async () => {
        try {
          const docRef = doc(this.firestore, FirestoreCollection.Stations + '/' + stationID);
          const tagsRef = doc(this.firestore, FirestoreCollection.StationTags + '/tags');

          if (update) {
            await updateDoc(docRef, {
              name: station.name,
              description: station.description,
              image: station.image,
              musics: station.musics,
              localData: ''
            });
          } else {
            await setDoc(docRef, {
              ...station,
              localData: ''
            });

            await updateDoc(tagsRef, {
              tags: arrayUnion(...station.tags)
            });
          }
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

  async getStations(filters: IFilters) {
    let orderByField = '';
    if (filters.orderBy === StationOrderBy.Likes) {
      orderByField = 'reactions.numLikes';
    } else if (filters.orderBy === StationOrderBy.Recent) {
      orderByField = 'timestamp';
    } else {
      orderByField = 'views';
    }
    
    let queryRef = query<IStation>(
      collection(this.firestore, FirestoreCollection.Stations) as CollectionReference<IStation>,
      orderBy(orderByField, 'desc')
    );
    
    if (filters.tags?.length > 0) {
      queryRef = query<IStation>(
        collection(this.firestore, FirestoreCollection.Stations) as CollectionReference<IStation>,
        where('tags', 'array-contains-any', filters.tags),
        orderBy(orderByField, 'desc')
      );
    }

    const docResp = await getDocs(queryRef)
    const stations = docResp.docs.map(resp => resp.data());
    return {
      stations,
      connectionError: docResp.metadata.fromCache
    };
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

  getComments(station: IStation) {
    const comments = [];
    let replyComments = [];
    const objReplyComments = {};
    for (const key of Object.keys(station.comments)) {
      comments.push(station.comments[key]);
      if (station.comments[key].answers) {
        replyComments = [];
        for (const keyr of Object.keys(station.comments[key].answers)) {
          replyComments.push(station.comments[key].answers[keyr]);
        }
        objReplyComments[station.comments[key].id] = replyComments;
      }
    }

    return {
      comments: this.orderComments(comments || []),
      replyComments: objReplyComments
    };
  }

  async addComment(comment: string, stationId: string, userName: string, replyComment?: IComment): Promise<IComment> {
    const uniqueId = uuidv4();

    let path = '';

    if (replyComment) {
      path = 'comments.' + replyComment.parentComment + '.answers.' + uniqueId;
    } else {
      path = 'comments.' + uniqueId;
    }

    const docRef = doc(this.firestore, FirestoreCollection.Stations + '/' + stationId);
    await updateDoc(docRef, {
      [path]: {
        id: uniqueId,
        userName,
        comment: comment,
        likes: {
          idUsers: {},
          numLikes: 0
        },
        timestamp: serverTimestamp() as Timestamp
      }
    });

    return {
      id: uniqueId,
      userName,
      comment: comment,
      likes: {
        idUsers: {},
        numLikes: 0
      },
      timestamp: {
        ...getFakeTimestamp(),
        seconds: new Date().getTime() / 1000
      }
    }
  }

  async getTags() {
    const docRef = doc(this.firestore, FirestoreCollection.StationTags + '/tags') as DocumentReference<{
      tags: string[]
    }>;

    const tags = await getDoc(docRef);
    this.localDbService.setTags(tags.data().tags);
    return tags.data().tags;
  }

  private orderComments(comments: IComment[]) {
    comments = comments.sort((a, b) => {
      if (a.timestamp.seconds < b.timestamp.seconds) {
        return 1;
      }
      if (a.timestamp.seconds > b.timestamp.seconds) {
        return -1;
      }
      return 0;
    });
    return comments;
  }
}
