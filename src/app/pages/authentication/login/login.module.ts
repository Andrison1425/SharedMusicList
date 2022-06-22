import { environment } from 'src/environments/environment.prod';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginPageRoutingModule } from './login-routing.module';

import { LoginPage } from './login.page';
import {ExtendedFirebaseUIAuthConfig, firebase, FirebaseUIModule } from 'firebaseui-angular-i18n';
import {AngularFireModule} from '@angular/fire/compat';

const firebaseUiAuthConfig: ExtendedFirebaseUIAuthConfig = {
  signInFlow: 'redirect',
  signInOptions: [
    firebase.auth.PhoneAuthProvider.PROVIDER_ID
  ],
  privacyPolicyUrl: 'https://docs.google.com/document/d/1XHJjxROjaA0F-ZO1wfhMDtM6noHxYip2F9bjKsXfFFc/edit?usp=sharing',
  language: 'it'
};

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginPageRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    FirebaseUIModule.forRoot(firebaseUiAuthConfig)
  ],
  declarations: [LoginPage]
})
export class LoginPageModule {}
