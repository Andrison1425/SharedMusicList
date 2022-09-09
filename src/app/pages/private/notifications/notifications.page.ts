import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Route } from 'src/app/enums/route.enum';
import { INotification } from 'src/app/interfaces/notification.interface';
import { LocalDbService } from 'src/app/services/local-db.service';
import { NotificationsService } from 'src/app/services/notifications.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit, OnDestroy {

  notifications: INotification[] = [];
  notificationsSubscribe: Subscription;
  stationImages: {
    [id: string]: string
  }[] = [];
  Routes: Route;

  constructor(
    private notificationsService: NotificationsService,
    private localDbService: LocalDbService
  ) { }

  ngOnInit() {
    this.notificationsSubscribe = this.notificationsService.getNotifications()
      .subscribe(notifications => {
        this.notifications = [...notifications, ...this.notifications];
      })

      this.localDbService.getFavoriteStations(this.localDbService.user.id)
        .then(resp => {
          this.stationImages = resp.map(ele => ({
            [ele.id]: ele.image.compress 
          }))

          console.log(this.stationImages)
        })
  }

  ngOnDestroy() {
    this.notificationsSubscribe.unsubscribe();
  }
}
