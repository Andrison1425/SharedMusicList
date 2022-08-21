import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SettingPageRoutingModule } from './setting-routing.module';

import { SettingPage } from './setting.page';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import {ExtendedFirebaseUIAuthConfig, firebase, FirebaseUIModule} from 'firebaseui-angular-i18n';

const firebaseUiAuthConfig: ExtendedFirebaseUIAuthConfig = {
  signInFlow: 'redirect',
  signInOptions: [
    firebase.auth.PhoneAuthProvider.PROVIDER_ID
  ],
  privacyPolicyUrl: 'https://docs.google.com/document/d/1XHJjxROjaA0F-ZO1wfhMDtM6noHxYip2F9bjKsXfFFc/edit?usp=sharing',
  language:'it'
};

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SettingPageRoutingModule,
    ReactiveFormsModule,
    NgxIntlTelInputModule,
    FirebaseUIModule.forRoot(firebaseUiAuthConfig)
  ],
  declarations: [SettingPage]
})
export class SettingPageModule {}
