import { Component, OnDestroy, OnInit } from '@angular/core';
import { Filesystem, Directory, FileInfo } from '@capacitor/filesystem';
import { extractExtension } from 'src/app/utils/utils';
import { Capacitor } from '@capacitor/core';
import { Howl } from 'howler';
import { ModalController, NavParams } from '@ionic/angular';
import { IMusic } from 'src/app/interfaces/music.interface';

@Component({
  selector: 'app-file-explorer',
  templateUrl: './file-explorer.component.html',
  styleUrls: ['./file-explorer.component.scss'],
})
export class FileExplorerComponent implements OnInit, OnDestroy {

  excludeDirectory = ['Android']
  audioExtensions = ['mp3', '3gp', 'aac', 'act', 'm4a', 'm4p', 'mpc', 'ogg', 'oga', 'mogg', 'webm']
  audioFiles: {
    [directory: string]: FileInfo[]
  } = {};
  player: Howl;
  pause = true;
  playingMusic: FileInfo;
  selectedMusics: FileInfo[] = [];
  directoriesName: string[] = [];

  constructor(
    private modalController: ModalController,
    private navParams: NavParams
  ) { }

  ngOnInit() {
    this.getAllAudioFiles();
    console.log(this.navParams.get('musics'))
    if (this.navParams.get('musics')) {
      this.navParams.get<IMusic[]>('musics').forEach(music => {
        this.selectedMusics.push({
          mtime: 0,
          name: music.title,
          size: music.size,
          type: 'file',
          uri: music.localPath
        })
      })
    }
  }

  ngOnDestroy(): void {
    this.player.unload();
  }

  async getAllAudioFiles() {
    const musicFiles: {
      [directory: string]: FileInfo[]
    } = {};

    let directoryName = '';

    const getFiles = async (directory: FileInfo) => {
      const directoryFiles = await Filesystem.readdir({
        path: directory.uri
      })

      for (let index = 0; index < directoryFiles.files.length; index++) {
        const file = directoryFiles.files[index];
        if (file.type === 'directory') {
          if (!this.excludeDirectory.includes(file.name)) {
            directoryName = file.name;
            await getFiles(file)
          }
        } else {
          if ((file.name.substring(0, 1) !== '.')) {
            const fileExtension = extractExtension(file.name);

            if (fileExtension && this.audioExtensions.includes(fileExtension)) {
              musicFiles[directoryName] = [...(musicFiles[directoryName] || []), file];
              this.directoriesName.includes(directoryName)? '': this.directoriesName.push(directoryName);
            }
          }
        }
      }
    }

    Filesystem.readdir({
      path: '',
      directory: Directory.ExternalStorage
    }).then(async (resp) => {

      for (let index = 0; index < resp.files.length; index++) {
        const file = resp.files[index];
        if (file.type === 'directory') {
          if (!this.excludeDirectory.includes(file.name)) {
            directoryName = file.name;
            await getFiles(file)
          }
        }
      }

      this.audioFiles = musicFiles;

    })

    return musicFiles
  }

  playMusic(music: FileInfo) {
    console.log(this.playingMusic?.uri, music.uri)
    if (this.playingMusic?.uri === music.uri) {
      this.tooglePlayer()
    } else {
      this.playingMusic = music;
      this.controls(Capacitor.convertFileSrc(music.uri));
    }
  }

  controls(src: string) {
    this.player?.unload();
    this.player = new Howl({
      src: [src],
      format: 'mp3',
      onend: () => {
        this.pause = true;
      }
    });

    this.pause = false;
    this.player.play();
  }

  setPause() {
    this.pause = false;
    this.tooglePlayer();
  }

  tooglePlayer() {
    if (this.pause) {
      this.player.play();
    } else {
      this.player.pause();
    }
    this.pause = !this.pause;
  }

  selectMusic(e, music: FileInfo) {
    if (e.detail.checked) {
      this.selectedMusics = [...this.selectedMusics, music];
    } else {
      this.selectedMusics = this.selectedMusics.filter(ele => ele.uri !== music.uri);
    }
  }

  addMusics() {
    this.modalController.dismiss({
      musics: this.selectedMusics,
      cancel: false
    });
  }

  cancel() {
    this.modalController.dismiss({
      musics: [],
      cancel: true
    });
  }

  isSelected(file: FileInfo) {
    return this.selectedMusics.find(ele => ele.uri === file.uri)? true: false;
  }
}
