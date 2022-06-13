import { LocalDbService } from './services/local-db.service';
import { Component } from '@angular/core';
import { StatusBar } from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private localDbService: LocalDbService
  ) {
    StatusBar.setBackgroundColor({color: '#390D02'});
    localDbService.initializeLocalDb();
  }
}
