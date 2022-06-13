import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { onAuthStateChanged, Auth} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class CompleteRegisterGuard implements CanActivate {

  constructor(
    private auth: Auth,
    private router: Router
  ) { }

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return new Promise((resolve) => {
      onAuthStateChanged(this.auth, user => {
        if (user && user?.uid) {
          resolve(true);
        } else {
          this.router.navigate(['/auth/login']);
          resolve(false);
        }
      });
    });
  }

}
