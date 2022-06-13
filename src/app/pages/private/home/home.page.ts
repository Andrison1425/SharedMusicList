import { Component, OnInit } from '@angular/core';
//import { NativeAudio } from '@awesome-cordova-plugins/native-audio/ngx';
import { BackgroundMode } from '@awesome-cordova-plugins/background-mode/ngx';
import { HttpClient } from '@angular/common/http';
import { Media, MediaObject } from '@awesome-cordova-plugins/media/ngx';
import { ForegroundService } from '@awesome-cordova-plugins/foreground-service/ngx';
import { Plugins } from '@capacitor/core';
const { CapacitorMusicControls: capacitorMusicControls } = Plugins;
import {Howl, Howler} from 'howler';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  srcAudio = '';
  player: any;
  musicCont = 0;
  mediaTimer: any;

  constructor(
    private backgroundMode: BackgroundMode,
    private http: HttpClient,
    private media: Media,
    private menu: MenuController
  ) {}

  async ngOnInit() {
    //let tracks = [];

    // const peticion = await fetch('https://cryptic-scrubland-73070.herokuapp.com/https://api.deezer.com/album/302127');
    // const data = await peticion.json();

    // tracks = data.tracks.data;
    // //this.player = this.media.create(tracks[0].preview);

    // this.player = new Howl({
    //   src: [tracks[0].preview],
    //   format: ['mp3', 'aac']
    // });
    // this.player.play();

    // this.backgroundMode.enable();
    // this.backgroundMode.disableWebViewOptimizations();

    // //this.player.play();

    // capacitorMusicControls.create({
    //   track       : 'Time is Running Out',
    //   artist      : 'Muse',
    //   album       : 'Absolution',
    //   cover       : 'albums/absolution.jpg',		// optional, default : nothing
    //   //			 or a remote url ('http://...', 'https://...', 'ftp://...')

    //   // hide previous/next/close buttons:
    //   hasPrev   : true,		// show previous button, optional, default: true
    //   hasNext   : true,		// show next button, optional, default: true
    //   hasClose  : false,		// show close button, optional, default: false
    //   // Android only, optional
    //   isPlaying   : true,							// optional, default : true
    //   dismissable : true,
    //   // text displayed in the status bar when the notification (and the ticker) are updated
    //   ticker	  : 'Now playing "Time is Running Out"',
    //   //All icons default to their built-in android equivalents
    //   //The supplied drawable name, e.g. 'media_play', is the name of a drawable found under android/res/drawable* folders
    //   playIcon: 'media_play',
    //   pauseIcon: 'media_pause',
    //   prevIcon: 'media_prev',
    //   nextIcon: 'media_next',
    //   closeIcon: 'media_close',
    //   notificationIcon: 'notification'
    // });


    // capacitorMusicControls.addListener('controlsNotification', (info: any) => {
    //   if(info.message === 'music-controls-next'){
    //     this.musicCont++;
    //     this.player.stop();
    //     this.player = new Howl({
    //       src: [tracks[this.musicCont].preview],
    //       format: ['mp3', 'aac'],
    //       html5: true
    //     });
    //     // this.player.onStatusUpdate.subscribe(status => {
    //     //   console.log(status);
    //     // });
    //     this.player.play();
    //   }
    // });

    // this.backgroundMode.on('activate').subscribe(() => {

    // });

  }

  openMenu() {
    this.menu.open('home-menu');
  }

}
