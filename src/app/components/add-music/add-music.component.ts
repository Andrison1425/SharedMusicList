import { ModalController, NavParams } from '@ionic/angular';
import { Colors } from 'src/app/enums/color.enum';
import { ToastService } from './../../services/toast.service';
import { IMusic } from './../../interfaces/music.interface';
import { FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-add-music',
  templateUrl: './add-music.component.html',
  styleUrls: ['./add-music.component.scss'],
})
export class AddMusicComponent implements OnInit {

  musicData: string;
  music: IMusic;
  pos: number;
  duration: number;
  @ViewChild('fileInput', { static: false }) fileInput;

  addMusicForm = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(60), Validators.minLength(1)]],
    artist: ['', [Validators.maxLength(40), Validators.minLength(1)]]
  });

  get title() { return this.addMusicForm.get('title'); }
  get artist() { return this.addMusicForm.get('artist'); }

  constructor(
    private fb: FormBuilder,
    private toastService: ToastService,
    private modalController: ModalController,
    private navParams: NavParams
  ) { }

  ngOnInit() {
    this.music = this.navParams.get('music');
    this.pos = this.navParams.get('pos');

    if(this.music) {
      this.title.setValue(this.music.title);
      this.artist.setValue(this.music.artist);
      this.musicData = this.music.localData;
    }
  }

  addMusic() {
    if(this.addMusicFormValidate()) {
      const music: IMusic = {
        title: this.title.value,
        artist: this.artist.value,
        downloadUrl: '',
        localData: this.musicData,
        id: 0,
        duration: this.duration,
        stationId: ''
      };

      this.modalController.dismiss({
        music: music,
        pos: this.pos
      });
    }
  }

  addMusicFormValidate() {
    if(this.title?.errors?.required) {
      this.toastService.presentToast('El título de la canción es obligatorio', Colors.DANGER);
      return false;
    }

    if(this.title?.errors?.minlength){
      this.toastService.presentToast('El título de la canción debe de ser de 1 caracter mínimo', Colors.DANGER, 5000);
      return false;
    }

    if(this.artist?.errors?.minlength){
      this.toastService.presentToast('El nombre del artista debe de ser de 1 caracter mínimo', Colors.DANGER, 5000);
      return false;
    }

    if(!this.musicData) {
      this.toastService.presentToast('El archivo de música es obligatorio', Colors.DANGER, 5000);
      return false;
    }

    return true;
  }

  onDuration(duration: number) {
    this.duration = duration;
  }

  closeModal() {
    this.modalController.dismiss();
  }

  uploadMusic() {
    this.fileInput.nativeElement.click();
  }

  fileChanged(event) {
    //this.musicData = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.musicData = reader.result as string;
      event.target.value = null;
    };
    reader.readAsDataURL(event.target.files[0]);
  }
}
