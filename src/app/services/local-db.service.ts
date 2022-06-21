import { IStation } from './../interfaces/station.interface';
import { IUser } from './../interfaces/user.interface';
import { LocalDbName } from './../enums/local-db-name.enum';
import { ILocalForage } from './../interfaces/localForange.interface';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
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

  constructor(
    private auth: Auth
  ) { /* */ }

  initializeLocalDb() {
    this.userDb = this.loadStore(LocalDbName.Users);
    this.stationDb = this.loadStore(LocalDbName.Stations);
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

  setStation(id: string, station: IStation): Promise<IStation> {
    station = {
      ...station,
      id
    };
    this.stations$.next(station);
    return this.stationDb.setItem(id, station);
  }

  stationsData() {
    return this.stations$.asObservable();
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
}
