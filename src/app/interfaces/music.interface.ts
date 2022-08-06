
export interface IMusic {
  title: string;
  artist: string;
  downloadUrl: string;
  localData?: string;
  id: string;
  duration?: number;
  stationId: string;
  localPath?: string;
  local: {
    isNew: boolean
  }
}
