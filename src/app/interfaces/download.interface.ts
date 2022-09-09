import { DownloadState } from "../enums/download-state.enum"
import { IMusic } from "./music.interface"

export interface IDownload {
    [musicId: string]: IDownloadData
}

export interface IDownloadData {
    music: IMusic,
    progress: number,
    state: DownloadState,
    id: string,
    fileUri: string
}