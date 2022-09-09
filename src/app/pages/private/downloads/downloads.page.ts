import { Component, OnInit } from '@angular/core';
import { Route } from 'src/app/enums/route.enum';
import { IDownloadData } from 'src/app/interfaces/download.interface';
import { LocalDbService } from 'src/app/services/local-db.service';

@Component({
  selector: 'app-downloads',
  templateUrl: './downloads.page.html',
  styleUrls: ['./downloads.page.scss'],
})
export class DownloadsPage implements OnInit {

  downloads: IDownloadData[] = [];
  Routes = Route;

  constructor(
    private localDbService: LocalDbService
  ) { }

  ngOnInit() {
    this.localDbService.getDownloads()
      .then(resp => {
        this.downloads = resp;
      })
  }

}
