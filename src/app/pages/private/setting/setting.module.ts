import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SettingPageRoutingModule } from './setting-routing.module';

import { SettingPage } from './setting.page';
import {ExtendedFirebaseUIAuthConfig, firebase, FirebaseUIModule} from 'firebaseui-angular-i18n';

const firebaseUiAuthConfig: ExtendedFirebaseUIAuthConfig = {
  signInFlow: 'redirect',
  signInOptions: [
    firebase.auth.PhoneAuthProvider.PROVIDER_ID
  ],
  privacyPolicyUrl: 'https://docs.google.com/document/d/1W8PzfDPGVovdenuG0Y3wHgYnZv9oe3sYXT-p40wRi_o/edit?usp=sharing',
  language:'it'
};

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SettingPageRoutingModule,
    ReactiveFormsModule,
    FirebaseUIModule.forRoot(firebaseUiAuthConfig)
  ],
  declarations: [SettingPage]
})
export class SettingPageModule {}
