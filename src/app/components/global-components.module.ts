import { ImageCropperModalComponent } from './image-cropper-modal/image-cropper-modal.component';
import { SkeletonComponent } from './skeleton/skeleton.component';
import { AudioComponent } from './audio/audio.component';
import { MusicPlayerComponent } from './music-player/music-player.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { StationItemComponent } from './station/station-item.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageCropperModule } from 'ngx-image-cropper';
import { FileExplorerComponent } from './file-explorer/file-explorer.component';
import { PopoverTrackComponent } from './popover-track/popover-track.component';
import { AddTrackPlaylistModalComponent } from './add-track-playlist-modal/add-track-playlist-modal.component';



@NgModule({
  declarations: [
    StationItemComponent,
    MusicPlayerComponent,
    AudioComponent,
    SkeletonComponent,
    ImageCropperModalComponent,
    FileExplorerComponent,
    PopoverTrackComponent,
    AddTrackPlaylistModalComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ImageCropperModule
  ],
  exports: [
    StationItemComponent,
    MusicPlayerComponent,
    AudioComponent,
    SkeletonComponent,
    ImageCropperModalComponent,
    FileExplorerComponent,
    PopoverTrackComponent,
    AddTrackPlaylistModalComponent
  ]
})
export class GlobalComponentsModule { }
