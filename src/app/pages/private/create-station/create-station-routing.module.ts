import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateStationPage } from './create-station.page';

const routes: Routes = [
  {
    path: '',
    component: CreateStationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateStationPageRoutingModule {}
