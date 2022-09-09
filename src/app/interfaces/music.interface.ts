
export interface IMusic {
  title: string;
  artist: string
  unapprovedArtists?: boolean;
  downloadUrl: string;
  localData?: string;
  id: string;
  duration?: number;
  stationId: string;
  localPath?: string;
  local: {
    isNew: boolean
  },
  size: number
}
