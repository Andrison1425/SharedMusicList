import { AuthenticationGuard } from './guards/authentication.guard';
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./pages/authentication/authentication.module').then(m => m.AuthenticationModule),
    data: {
      module: 'authentication'
    },
    canActivate: [AuthenticationGuard]
  },
  {
    path: 'radio',
    loadChildren: () => import('./pages/private/private.module').then(m => m.PrivateModule),
    data: {
      module: 'private'
    },
    canActivate: [AuthenticationGuard]
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'radio'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
