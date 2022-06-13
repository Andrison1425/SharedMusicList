import { CompleteRegisterGuard } from './../../guards/complete-register.guard';
import { canActivate, redirectLoggedInTo } from '@angular/fire/auth-guard';
//import { CompleteRegisterGuard } from './../guards/complete-register.guard';
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { Route } from 'src/app/enums/route.enum';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule),
    ...canActivate(() => redirectLoggedInTo([Route.Register]))
  },
  {
    path: 'register',
    loadChildren: () => import('./register/register.module').then(m => m.RegisterPageModule),
    canActivate: [CompleteRegisterGuard]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AuthenticationRoutingModule { }
