import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { StationItemComponent } from './station/station-item.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';



@NgModule({
  declarations: [
    StationItemComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  exports: [
    StationItemComponent
  ]
})
export class GlobalComponentsModule { }
