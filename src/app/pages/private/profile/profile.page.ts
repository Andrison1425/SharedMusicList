import { IStation } from './../../../interfaces/station.interface';
import { ModalController } from '@ionic/angular';
import { LocalDbService } from './../../../services/local-db.service';
import { IUser } from './../../../interfaces/user.interface';
import { Component, OnInit } from '@angular/core';
import { Route } from 'src/app/enums/route.enum';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  Routes = Route;
  user: IUser;
  isModalCreateStatioOpen = false;
  stations: IStation[] = [];

  constructor(
    private localDbService: LocalDbService,
    private modalController: ModalController
  ) { /**/}

  ngOnInit() {
    this.localDbService.getLocalUser()
      .then(resp => this.user = resp);

    this.localDbService.userData()
      .subscribe(resp => {
        this.user = resp;
      });

    this.localDbService.getAllStation()
      .then(stations => this.stations = stations);
  }

}
