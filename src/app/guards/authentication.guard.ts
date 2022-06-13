import { LocalDbService } from './../services/local-db.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { onAuthStateChanged, Auth} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationGuard implements CanActivate {

  constructor(
    private auth: Auth,
    private router: Router,
    private localDbService: LocalDbService
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

      return new Promise((resolve) => {
        onAuthStateChanged(this.auth, user => {
          this.localDbService.getLocalUser()
            .then(resp => {
              if (route.data.module === 'private') {
                if (user?.uid && resp) {
                  resolve(true);
                } else {
                  this.router.navigate(['/auth/login']);
                  resolve(false);
                }
              } else {
                if (!resp) {
                  resolve(true);
                } else {
                  this.router.navigate(['radio/']);
                  resolve(false);
                }
              }
            });
        })
      });
  }

}
