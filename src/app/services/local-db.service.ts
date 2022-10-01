import { IPlaylist } from '../interfaces/playlist.interface';
import { IUser } from './../interfaces/user.interface';
import { LocalDbName } from './../enums/local-db-name.enum';
import { ILocalForage } from './../interfaces/localForange.interface';
import { Injectable } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';
import { onAuthStateChanged, Auth} from '@angular/fire/auth';
import { getFakeTimestamp } from '../utils/utils';
import { IDownload, IDownloadData } from '../interfaces/download.interface';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const localForage = require('localforage') as ILocalForage;

@Injectable({
  providedIn: 'root'
})
export class LocalDbService {

  private userData$ = new Subject<IUser>();
  user: IUser;
  private userDb: ILocalForage;
  private playlists$ = new Subject<IPlaylist>();
  playlists: IPlaylist[];
  private stationDb: ILocalForage;
  private favoriteStations$ = new ReplaySubject<IPlaylist[]>(1);
  private myPlaylists$ = new ReplaySubject<IPlaylist[]>(1);
  private tagsDb: ILocalForage;
  private artistsDb: ILocalForage;
  private musicDownloadsDb: ILocalForage;

  constructor(
    private auth: Auth
  ) { /* */ }

  initializeLocalDb() {
    this.userDb = this.loadStore(LocalDbName.Users);
    this.stationDb = this.loadStore(LocalDbName.Stations);
    this.tagsDb = this.loadStore(LocalDbName.Tags);
    this.artistsDb = this.loadStore(LocalDbName.Artists);
    this.musicDownloadsDb = this.loadStore(LocalDbName.MusicDownloads);

    this.getLocalUser()
      .then(user => {
        if (user) {
          this.getFavoriteStations(user.id)
            .then(stations => {
              this.favoriteStations$.next(stations || []);
            })
        }
      })
  }

  loadStore(name: LocalDbName): ILocalForage {
    return localForage.createInstance({
      name: localForage._config.name,
      storeName: name
    });
  }

  getLocalUser() {
    return new Promise<IUser>((resolve) => {
      onAuthStateChanged(this.auth, async (user) => {
        if(user?.uid) {
          const userData: IUser = await this.userDb.getItem(user.uid);
          this.user = userData;
          resolve(userData);
        } else {
          resolve(null);
        }
      });
    });
  }

  userData() {
    return this.userData$.asObservable();
  }

  setUserData(id: string, user: IUser): Promise<IUser> {
    this.userData$.next(user);
    console.log(user.createDate.nanoseconds, user.createDate.seconds)
    return this.userDb.setItem(id, {
      ...user,
      createDate: {
        nanoseconds: user.createDate.nanoseconds,
        seconds: user.createDate.seconds
      }
    });
  }

  async setStation(id: string, playlist: IPlaylist, isFavoriteStation = false): Promise<IPlaylist> {
    const localStation = await this.getStation(id);

    if (localStation) {
      const musicIds = localStation.musics.map(resp => resp.id);
      playlist.musics = playlist.musics.map(music => {
        return {
          ...music,
          local: {
            isNew: musicIds.includes(music.id)? false: true
          }
        }
      });
    }

    playlist = {
      ...playlist,
      id
    };

    if (isFavoriteStation) {
      const favoriteStations = await this.getFavoriteStations(this.user.id);
      this.favoriteStations$.next([playlist, ...favoriteStations]);
    } else {
      this.playlists$.next(playlist);
      const myPlaylists = await this.getMyPlaylists(this.user.id);
      this.myPlaylists$.next([playlist, ...myPlaylists]);
    }
    
    return this.stationDb.setItem(id, playlist);
  }

  getPlaylists() {
    return this.playlists$.asObservable();
  }

  favoriteStationsData() {
    return this.favoriteStations$.asObservable();
  }

  async getStation(id: string) {
    const station: IPlaylist = await this.stationDb.getItem(id);
    return station;
  }

  myPlaylists() {
    return this.myPlaylists$.asObservable();
  }

  async getMyPlaylists(userId: string) {
    const stations: IPlaylist[] = [];
    await this.stationDb.iterate((values: IPlaylist, key) => {
      if (values.author.id === userId) {
        stations.push({
          id: key,
          ...values
        });
      }
    });

    return stations;
  }

  async getFavoriteStations(userId: string) {
    const stations: IPlaylist[] = [];
    await this.stationDb.iterate((values: IPlaylist, key) => {
      if (values.author.id !== userId) {
        stations.push({
          id: key,
          ...values
        });
      }
    });

    return stations;
  }

  deleteStation(id: string) {
    this.stationDb.removeItem(id);
  }

  async removeFavoriteStation(id: string) {
    await this.stationDb.removeItem(id);

    const favoriteStations = await this.getFavoriteStations(this.user.id);
    this.favoriteStations$.next(favoriteStations);
  }

  setTags(tags: string[]){
    this.tagsDb.setItem('tags', tags);
    return tags;
  }

  async getTags(){
    const tags = await this.tagsDb.getItem('tags');
    return tags as string[];
  }

  setArtists(artists: string[]){
    this.artistsDb.setItem('artists', artists);
    return artists;
  }

  async getArtists(){
    const artists = await this.artistsDb.getItem('artists');
    return artists as string[];
  }

  addMusicDownload(download: IDownloadData) {
    this.musicDownloadsDb.setItem(download.id, download);
  }

  async getDownloads(): Promise<IDownloadData[]> {
    const downloads: IDownloadData[] = [];
    await this.musicDownloadsDb.iterate((value: IDownloadData) => {
      downloads.push(value);
    });

    return downloads;
  }
}
