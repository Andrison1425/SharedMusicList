import { BackgroundModeService } from './services/background-mode.service';
import { LocalDbService } from './services/local-db.service';
import { Component } from '@angular/core';
import { StatusBar } from '@capacitor/status-bar';
import { NotificationsService } from './services/notifications.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    localDbService: LocalDbService,
    backgroundModeService: BackgroundModeService,
    notificationsService: NotificationsService
  ) {
    StatusBar.setBackgroundColor({color: '#390D02'});
    localDbService.initializeLocalDb();
    backgroundModeService.initialize();
    notificationsService.initialize();
  }
}
