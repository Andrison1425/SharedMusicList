import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StationPage } from './station.page';

const routes: Routes = [
  {
    path: '',
    component: StationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StationPageRoutingModule {}
