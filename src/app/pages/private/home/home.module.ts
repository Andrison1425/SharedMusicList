import { MenuComponent } from '../../../components/menu/menu.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { GlobalComponentsModule } from 'src/app/components/global-components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [
    HomePage,
    MenuComponent
  ]
})
export class HomePageModule {}
