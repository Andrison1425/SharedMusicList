//import { CompleteRegisterGuard } from './../guards/complete-register.guard';
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'profile/:id',
    loadChildren: () => import('./profile/profile.module').then(m => m.ProfilePageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then(m => m.ProfilePageModule)
  },
  {
    path: 'create-station',
    loadChildren: () => import('./create-station/create-station.module').then( m => m.CreateStationPageModule)
  },
  {
    path: 'station/:id',
    loadChildren: () => import('./station/station.module').then( m => m.StationPageModule)
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: ''
  },


];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class PrivateRoutingModule { }
