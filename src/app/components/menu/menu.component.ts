import { Capacitor } from '@capacitor/core';
import { LocalDbService } from './../../services/local-db.service';
import { IUser } from './../../interfaces/user.interface';
import { Component, OnInit } from '@angular/core';
import { Route } from 'src/app/enums/route.enum';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {

  Routes = Route;
  user: IUser;
  imgPath = '../../../assets/img/person.jpg';

  constructor(
    private localDbService: LocalDbService
  ) { }

  ngOnInit() {
    this.localDbService.getLocalUser()
      .then(resp => {
        this.user = resp
        if (resp.profileImage.imageLocalPath) {
          this.imgPath = Capacitor.convertFileSrc(resp.profileImage.imageLocalPath);
        }
      });

    this.localDbService.userData().subscribe(resp => {
      this.user = resp;
      if (resp.profileImage.imageLocalPath) {
        this.imgPath = Capacitor.convertFileSrc(resp.profileImage.imageLocalPath);
      }
    });
  }

}
