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

  constructor(
    private localDbService: LocalDbService
  ) { }

  ngOnInit() {
    this.localDbService.getLocalUser()
      .then(resp => this.user = resp);

    this.localDbService.userData().subscribe(resp => {
      this.user = resp;
    });
  }

}
