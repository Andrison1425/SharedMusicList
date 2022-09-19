import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PlaylistsPageRoutingModule } from './playlists-routing.module';

import { PlaylistsPage } from './playlists.page';
import { GlobalComponentsModule } from 'src/app/components/global-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PlaylistsPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [PlaylistsPage]
})
export class PlaylistsPageModule {}
