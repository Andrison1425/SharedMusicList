import { GlobalComponentsModule } from './../../../components/global-components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StationPageRoutingModule } from './station-routing.module';

import { StationPage } from './station.page';
import { CustomPipesModule } from 'src/app/pipes/custom-pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StationPageRoutingModule,
    GlobalComponentsModule,
    ReactiveFormsModule,
    CustomPipesModule
  ],
  declarations: [
    StationPage
  ]
})
export class StationPageModule {}
