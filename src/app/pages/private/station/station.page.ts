import { ToastService } from './../../../services/toast.service';
import { IUser } from './../../../interfaces/user.interface';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IComment } from './../../../interfaces/comment.interface';
import { PlaylistService } from '../../../services/playlist.service';
import { IMusic } from './../../../interfaces/music.interface';
import { MusicService } from './../../../services/music.service';
import { IPlaylist } from '../../../interfaces/playlist.interface';
import { LocalDbService } from './../../../services/local-db.service';
import { Component, OnInit } from '@angular/core';
import { Route } from 'src/app/enums/route.enum';
import { ActivatedRoute, Params } from '@angular/router';
import { MusicState } from 'src/app/enums/music-state.enum';
import { Colors } from 'src/app/enums/color.enum';

@Component({
  selector: 'app-station',
  templateUrl: './station.page.html',
  styleUrls: ['./station.page.scss'],
})
export class StationPage implements OnInit {

  Routes = Route;
  station: IPlaylist;
  stationID: string;
  musicPlaying: IMusic;
  musicState: MusicState;
  musicStateEnum = MusicState;
  comments: IComment[] = [];
  replyComments = {};
  replyComment: IComment;
  activeTab: 'COMMENTS' | 'TRACKS' = 'TRACKS';
  user: IUser;
  lastView: number;
  isLocalStation = false;
  routeQuery: Params;

  commentsForm: FormGroup = this.fb.group({
    comment: ['', [Validators.required, Validators.minLength(1)]]
  });
  comment = this.commentsForm.get('comment');

  constructor(
    private route: ActivatedRoute,
    private localDbService: LocalDbService,
    private musicService: MusicService,
    private playlistService: PlaylistService,
    private fb: FormBuilder,
    private toastService: ToastService,
  ) { }

  ngOnInit() {
    this.stationID = this.route.snapshot.paramMap.get('id');
    this.lastView = Number(localStorage.getItem('lastView-' + this.stationID));
    localStorage.setItem('lastView-' + this.stationID, String(new Date().valueOf()));

    this.localDbService.getStation(this.stationID)
      .then(resp => {
        if (resp) {
          this.station = resp;
          this.isLocalStation = true;
          const commentsData = this.playlistService.getComments(this.station);
          if (commentsData) {
            this.replyComments = commentsData.replyComments;
            this.comments = commentsData.comments;
          }

          //this.musicState = MusicState.Pause;
        } else {
          this.playlistService.getStation(this.stationID)
            .then(station => {
              this.station = station;
            })
            .catch(e => console.log(e))
        }
      }).catch(e => console.log(e));

    this.musicService.musicPlayingInfo()
      .subscribe(resp => {
        if (resp.music) {
          this.musicPlaying = resp.music;
          this.musicState = resp.state;
        } else {
          this.musicPlaying = null;
          this.musicState = null;
        }
      });

    this.localDbService.getLocalUser()
      .then(user => this.user = user)
      .catch(e => console.log(e));

    this.route.queryParams
      .subscribe(params => {
        this.routeQuery = params;
      });

  }

  trackByFn(index: number, music: IMusic) {
    return music.id;
  }

  segmentChanged(ev) {
    if (ev.detail.value === 'COMMENTS') {
      this.activeTab = 'COMMENTS';
    } else {
      this.activeTab = 'TRACKS';
    }
  }

  addReplyComment(comment: IComment, parentComment: string, isSubReply = false) {
    this.replyComment = {
      ...comment,
      parentComment
    };
    if (isSubReply) {
      this.comment.setValue(`@${comment.userName} ${this.comment.value}`);
    }
  }

  async addComment() {
    const replyCommentTmp = this.replyComment;
    this.playlistService.addComment(this.comment.value, this.station.id, this.user.userName, this.replyComment)
      .then(newComment => {
        if (replyCommentTmp?.parentComment) {
          this.replyComments[replyCommentTmp.parentComment].unshift(newComment);
        } else {
          this.comments.unshift(newComment);
          this.replyComments[newComment.id] = [];
        }
      })
      .catch(() => {
        this.toastService.presentToast('Error al enviar el comentario', Colors.DANGER);
      });

    this.comment.setValue('');
    this.replyComment = null;
  }

  deleteReply() {
    this.replyComment = null;
  }

  onPlayMusic(music: IMusic) {
    if (this.musicPlaying) {
      if (this.musicPlaying.stationId !== this.stationID) {
        this.musicService.loadMusics(this.station.musics)
      }
    } else {
      this.musicService.loadMusics(this.station.musics)
    }
  }
}

