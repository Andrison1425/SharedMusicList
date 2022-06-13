import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { NativeAudio } from '@awesome-cordova-plugins/native-audio/ngx';
import { BackgroundMode } from '@awesome-cordova-plugins/background-mode/ngx';
import { HttpClientModule } from '@angular/common/http';
import { Media } from '@awesome-cordova-plugins/media/ngx';
import { ForegroundService } from '@awesome-cordova-plugins/foreground-service/ngx';
import { environment } from 'src/environments/environment.prod';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent
  ],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage())
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    NativeAudio,
    BackgroundMode,
    Media,
    ForegroundService
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
