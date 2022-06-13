import { GlobalComponentsModule } from './../../../components/global-components.module';
import { AudioComponent } from './../../../components/audio/audio.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfilePageRoutingModule } from './profile-routing.module';

import { ProfilePage } from './profile.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfilePageRoutingModule,
    ReactiveFormsModule,
    GlobalComponentsModule
  ],
  declarations: [
    ProfilePage,
    AudioComponent
  ]
})
export class ProfilePageModule {}
