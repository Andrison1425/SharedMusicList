import { IMusic } from './music.interface';

export interface IStation {
  id?: string,
  musics: IMusic[],
  name: string,
  description: string,
  inReproduction: number,
  author: {
    userName: string,
    id: string,
    phofileImage: {
      compressImage?: string
    }
  }
}
