import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GlobalComponentsModule } from './components/global-components.module';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BackgroundMode } from '@awesome-cordova-plugins/background-mode/ngx';
import { HttpClientModule } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularFireMessagingModule } from '@angular/fire/compat/messaging';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { MusicControls } from '@awesome-cordova-plugins/music-controls/ngx';

@NgModule({
  declarations: [
    AppComponent
  ],
  entryComponents: [],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    ReactiveFormsModule,
    GlobalComponentsModule,
    HttpClientModule,
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
    AngularFireMessagingModule,
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage())
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    BackgroundMode,
    MusicControls,
    FileOpener
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
