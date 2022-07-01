import { ToastService } from './../../../services/toast.service';
import { IUser } from './../../../interfaces/user.interface';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IComment } from './../../../interfaces/comment.interface';
import { StationService } from './../../../services/station.service';
import { IMusic } from './../../../interfaces/music.interface';
import { MusicService } from './../../../services/music.service';
import { IStation } from './../../../interfaces/station.interface';
import { LocalDbService } from './../../../services/local-db.service';
import { Component, OnInit } from '@angular/core';
import { Route } from 'src/app/enums/route.enum';
import { ActivatedRoute } from '@angular/router';
import { MusicState } from 'src/app/enums/music-state.enum';
import { Colors } from 'src/app/enums/color.enum';

@Component({
  selector: 'app-station',
  templateUrl: './station.page.html',
  styleUrls: ['./station.page.scss'],
})
export class StationPage implements OnInit {

  Routes = Route;
  station: IStation;
  stationID: string;
  musicPlayingId: number;
  musicState: MusicState;
  musicStateEnum = MusicState;
  comments: IComment[] = [];
  replyComments = {};
  replyComment: IComment;
  activeTab: 'COMMENTS' | 'TRACKS' = 'TRACKS';
  user: IUser;

  commentsForm: FormGroup = this.fb.group({
    comment: ['', [Validators.required, Validators.minLength(1)]]
  });
  comment = this.commentsForm.get('comment');

  constructor(
    private route: ActivatedRoute,
    private localDbService: LocalDbService,
    private musicService: MusicService,
    private stationService: StationService,
    private fb: FormBuilder,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.stationID = this.route.snapshot.paramMap.get('id');
    this.localDbService.getStation(this.stationID)
      .then(resp => {
        if (resp) {
          this.station = resp;
          const commentsData = this.stationService.getComments(this.station);
          if (commentsData) {
            this.replyComments = commentsData.replyComments;
            this.comments = commentsData.comments;
          }

          this.musicState = MusicState.Pause;

          this.musicService.musicPlayingInfo()
            .subscribe(resp => {
              if (resp.music) {
                this.musicPlayingId = resp.music.id;
                this.musicState = resp.state;
              } else {
                this.musicPlayingId = null;
                this.musicState = null;
              }
            });
        } else {
          this.stationService.getStation(this.stationID)
            .then(station => {
              this.station = station;
            })
        }
      });

    this.localDbService.getLocalUser()
      .then(user => this.user = user);
  }

  play(music: IMusic) {
    if (music.id === this.musicPlayingId) {
      this.musicService.play(true, music.id);
    } else {
      this.musicService.play(false, music.id);
    }
  }

  pause() {
    this.musicService.pause();
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
    this.stationService.addComment(this.comment.value, this.station.id, this.user.userName, this.replyComment)
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
}
