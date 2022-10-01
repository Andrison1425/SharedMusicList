import { BackgroundModeService } from './services/background-mode.service';
import { LocalDbService } from './services/local-db.service';
import { Component, ViewChild } from '@angular/core';
import { StatusBar } from '@capacitor/status-bar';
import { NotificationsService } from './services/notifications.service';
import { DownloadService } from './services/download.service';
import { IonModal } from '@ionic/angular';
import { IMusic } from './interfaces/music.interface';
import { IDownload } from './interfaces/download.interface';
import { DownloadState } from './enums/download-state.enum';
import { DeepLinkService } from './services/deep-link.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  @ViewChild('downloadingModal') downloadingModal: IonModal;
  downloads: IDownload = {};
  DownloadState = DownloadState;

  constructor(
    private localDbService: LocalDbService,
    private backgroundModeService: BackgroundModeService,
    private notificationsService: NotificationsService,
    private downloadService: DownloadService,
    private deepLinkService: DeepLinkService
  ) {
    StatusBar.setBackgroundColor({ color: '#390D02' });
    localDbService.initializeLocalDb();
    backgroundModeService.initialize();
    notificationsService.initialize();
    deepLinkService.initialize();

    downloadService.onShowDownloadsModal()
      .subscribe(() => {
        this.downloadingModal.present();
      })

    downloadService.getDownloads()
      .subscribe(resp => {
        this.downloads = resp;
      })
  }

  cancelDownload(music: IMusic) {
    this.downloadService.cancelDownload(music);
  }

  viewDownloadInExplorer(downloadUri: string) {
    this.downloadService.openDownloadInExplorer(downloadUri);
  }
}
