import { GlobalComponentsModule } from './../../../components/global-components.module';
import { AddMusicComponent } from './../../../components/add-music/add-music.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { IonicModule } from '@ionic/angular';

import { CreateStationPageRoutingModule } from './create-station-routing.module';

import { CreateStationPage } from './create-station.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgSelectModule,
    ReactiveFormsModule,
    CreateStationPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [
    CreateStationPage,
    AddMusicComponent
  ]
})
export class CreateStationPageModule {}
