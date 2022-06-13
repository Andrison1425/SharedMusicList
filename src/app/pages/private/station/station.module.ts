import { GlobalComponentsModule } from './../../../components/global-components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StationPageRoutingModule } from './station-routing.module';

import { StationPage } from './station.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StationPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [
    StationPage
  ]
})
export class StationPageModule {}
