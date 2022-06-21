import { Timestamp } from '@angular/fire/firestore';
import { IMusic } from './music.interface';

export interface IStation {
  id: string,
  musics: IMusic[],
  name: string,
  description: string,
  inReproduction: number,
  author: {
    userName: string,
    id: string
  },
  reactions: {
    numLikes: number,
    numDislikes: number,
    idUsersAndReaction: object,
  },
  views: number,
  timestamp: Timestamp,
  image: {
    localPath: string,
    path: string,
    compress: string
  }
}
