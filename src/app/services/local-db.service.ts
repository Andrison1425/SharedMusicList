import { IStation } from './../interfaces/station.interface';
import { IUser } from './../interfaces/user.interface';
import { LocalDbName } from './../enums/local-db-name.enum';
import { ILocalForage } from './../interfaces/localForange.interface';
import { Injectable } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';
import { onAuthStateChanged, Auth} from '@angular/fire/auth';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const localForage = require('localforage') as ILocalForage;

@Injectable({
  providedIn: 'root'
})
export class LocalDbService {

  private userData$ = new Subject<IUser>();
  user: IUser;
  private userDb: ILocalForage;
  private stations$ = new Subject<IStation>();
  stations: IStation[];
  private stationDb: ILocalForage;
  private favoriteStations$ = new ReplaySubject<IStation[]>(1);
  private tagsDb: ILocalForage;
  private artistsDb: ILocalForage;

  constructor(
    private auth: Auth
  ) { /* */ }

  initializeLocalDb() {
    this.userDb = this.loadStore(LocalDbName.Users);
    this.stationDb = this.loadStore(LocalDbName.Stations);
    this.tagsDb = this.loadStore(LocalDbName.Tags);
    this.artistsDb = this.loadStore(LocalDbName.Artists);

    this.getLocalUser()
      .then(user => {
        this.getFavoriteStations(user.id)
          .then(stations => {
            this.favoriteStations$.next(stations || []);
          })
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
    return this.userDb.setItem(id, user);
  }

  async setStation(id: string, station: IStation, isFavoriteStation = false): Promise<IStation> {
    const localStation = await this.getStation(id);

    if (localStation) {
      const musicIds = localStation.musics.map(resp => resp.id);
      station.musics = station.musics.map(music => {
        return {
          ...music,
          local: {
            isNew: musicIds.includes(music.id)? false: true
          }
        }
      });
    }

    station = {
      ...station,
      id
    };

    if (isFavoriteStation) {
      const favoriteStations = await this.getFavoriteStations(this.user.id);
      this.favoriteStations$.next([station, ...favoriteStations]);
    } else {
      this.stations$.next(station);
    }
    return this.stationDb.setItem(id, station);
  }

  stationsData() {
    return this.stations$.asObservable();
  }

  favoriteStationsData() {
    return this.favoriteStations$.asObservable();
  }

  async getStation(id: string) {
    const station: IStation = await this.stationDb.getItem(id);
    return station;
  }

  async getMyStations(userId: string) {
    const stations: IStation[] = [];
    await this.stationDb.iterate((values: IStation, key) => {
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
    const stations: IStation[] = [];
    await this.stationDb.iterate((values: IStation, key) => {
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
}
