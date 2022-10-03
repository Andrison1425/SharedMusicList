import { getFakeTimestamp } from '../utils/utils';
import { IComment } from '../interfaces/comment.interface';
import { StationOrderBy } from '../enums/station-order-by.enum';
import { Reaction } from '../enums/reaction.enum';
import { Injectable } from '@angular/core';
import { serverTimestamp, setDoc, Firestore, deleteDoc, doc, collection, orderBy, getDoc, getDocs, query, updateDoc, 
         CollectionReference, increment, DocumentReference, where, Timestamp, arrayUnion, limit, QueryDocumentSnapshot, QueryConstraint, startAfter 
       } from '@angular/fire/firestore';
import { FirestoreCollection } from '../enums/firestore-collection.enum';
import { IPlaylist } from '../interfaces/playlist.interface';
import { LocalDbService } from './local-db.service';
import * as uniqid from 'uniqid';
import { IFilters } from '../interfaces/filters.interface';
import { IMusic } from '../interfaces/music.interface';
import { LoadingService } from './loading.service';
import { Colors } from '../enums/color.enum';
import { ToastService } from './toast.service';
import { DownloadService } from './download.service';
import { Folder } from '../enums/folder.enum';
import { AlertController } from '@ionic/angular';
import { PlaylistType } from '../enums/playlist-type.enum';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {

  lastDocumentForPagination: QueryDocumentSnapshot<IPlaylist>;

  constructor(
    private localDbService: LocalDbService,
    private firestore: Firestore,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private downloadService: DownloadService,
    private alertController: AlertController,
  ) { }

  createOrUpdateStation(station: IPlaylist, stationID: string, update?: boolean) {
    return new Promise<string>((resolve, rejeact) => {
      (async () => {
        try {
          const docRef = doc(this.firestore, FirestoreCollection.Stations + '/' + stationID);
          const tagsRef = doc(this.firestore, FirestoreCollection.StationTags + '/tags');
          station.musics = station.musics.map(music => ({ ...music, localPath: '' }));
          if (update) {
            await updateDoc(docRef, {
              name: station.name,
              description: station.description,
              image: station.image,
              musics: station.musics.map(music => ({ ...music, localPath: '' })),
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

  async getPlaylists(filters: IFilters, start: number) {
    let orderByField = '';
    if (filters.orderBy === StationOrderBy.Likes) {
      orderByField = 'reactions.numLikes';
    } else if (filters.orderBy === StationOrderBy.Recent) {
      orderByField = 'timestamp';
    } else {
      orderByField = 'views';
    }
    
    let queries: QueryConstraint[] = [
      orderBy(orderByField, 'desc'),
      limit(15)
    ];

    if (start > 0) {
      queries.push(startAfter(this.lastDocumentForPagination))
    }
    
    let queryRef = query<IPlaylist>(
      collection(this.firestore, FirestoreCollection.Stations) as CollectionReference<IPlaylist>,
      ...queries
    );
    
    if (filters.tags?.length > 0) {
      queries = [
        where('tags', 'array-contains-any', filters.tags),
        orderBy(orderByField, 'desc'),
        limit(15)
      ];
  
      if (start > 0) {
        queries.push(startAfter(this.lastDocumentForPagination))
      }

      queryRef = query<IPlaylist>(
        collection(this.firestore, FirestoreCollection.Stations) as CollectionReference<IPlaylist>,
        ...queries
      );
    }
    const docResp = await getDocs(queryRef);
    this.lastDocumentForPagination = docResp.docs[docResp.docs.length-1];

    const stations = docResp.docs.map(resp => resp.data());

    return {
      stations,
      connectionError: docResp.metadata.fromCache
    };
  }

  async getStation(id: string) {
    const docRef = doc(this.firestore, FirestoreCollection.Stations + '/' + id ) as DocumentReference<IPlaylist>;
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
    return new Promise<IPlaylist>((resolve, rejeact) => {
      (async () => {
        try {
          const docRef = doc(this.firestore, FirestoreCollection.Stations + '/' + stationId) as DocumentReference<IPlaylist>;
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
    const queryRef = query<IPlaylist>(
      collection(this.firestore, FirestoreCollection.Stations) as CollectionReference<IPlaylist>,
      where('author.id', '==', userID),
      orderBy('reactions.numLikes', 'asc')
    );

    const docResp = await getDocs(queryRef);
    const stations = docResp.docs.map(resp => resp.data());

    return stations;
  }

  getComments(station: IPlaylist) {
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
    const uniqueId = uniqid();

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

  async createPlaylistWithName(track: IMusic) {
    const alert = await this.alertController.create({
      header: 'Crear lista de reproducción privada',
      buttons: [  {
        text: 'Crear',
        handler: ({playlistName}) => {
          if (playlistName.trim().length < 3) {
            this.toastService.presentToast('El nombre de la lista debe tener 3 o más caracteres', Colors.DANGER, 3000);
            return false;
          } else {
            this.createPrivatePlaylist(playlistName, track)
            return true;
          }
        }
      }],
      inputs: [
        {
          placeholder: 'Nombre de la lista',
          attributes: {
            maxlength: 40,
            minlength: 3
          },
          name: 'playlistName'
        }
      ],
    });

    await alert.present();
  }

  private async uploadImage() {
    return {
      compress: '',
      path: '',
      localPath: ''
    }
  }

  private async createPrivatePlaylist(name: string, track: IMusic) {
    this.loadingService.present('Creando lista de reproducción');
    const playlistID = uniqid();

    try {
      track.id = uniqid();
      track.stationId = playlistID;
      const localPath = await this.downloadService.downloadMusic(track, `${track.title + '--' + track.id}.mp3`, `${Folder.Tracks + name}/`)
      track.localPath = localPath;
      track.localData = '';
    } catch (error) {
      this.loadingService.dismiss();
      this.toastService.presentToast('Error de conexión', Colors.DANGER, 3000);
    }

    const artistsName = [track.artist];

    const user = await this.localDbService.getLocalUser();

    const station: IPlaylist = {
      id: playlistID,
      name: name,
      description: 'Sin descripción',
      type: PlaylistType.PRIVATE,
      artistsName: artistsName,
      author: {
        id: user.id,
        userName: user.userName
      },
      image: await this.uploadImage(),
      musics: [track],
      views: 0,
      reactions: {
        idUsersAndReaction: {},
        numDislikes: 0,
        numLikes: 0
      },
      timestamp: serverTimestamp() as Timestamp,
      comments: [],
      tags: []
    };

    this.localDbService.setStation(playlistID, station)
      .then(() => {
        this.loadingService.dismiss();
        this.toastService.presentToast('Se ha creado la lista de reproducción', Colors.SUCCESS);
      })
      .catch((e) => {
        console.log(e)
        this.loadingService.dismiss();
        this.toastService.presentToast('Error al tratar de crear la lista de reproducción', Colors.DANGER);
      })
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
