import { IComment } from './comment.interface';
import { Timestamp } from '@angular/fire/firestore';
import { IMusic } from './music.interface';
import { PlaylistType } from '../enums/playlist-type.enum';

export interface IPlaylist {
  id: string,
  musics: IMusic[],
  name: string,
  description: string,
  artistsName: string[],
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
  },
  comments: IComment[],
  tags: string[],
  type: PlaylistType
}
