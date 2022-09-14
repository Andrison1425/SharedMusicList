import { LocalDbService } from './../../../services/local-db.service';
import { UserService } from './../../../services/user.service';
import { ToastService } from '../../../services/toast.service';
import { LoadingService } from '../../../services/loading.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Colors } from 'src/app/enums/color.enum';
import { signInAnonymously, Auth } from '@angular/fire/auth';
import { Route } from 'src/app/enums/route.enum';
import { FirebaseUISignInSuccessWithAuthResult } from 'firebaseui-angular-i18n';
import { StationService } from 'src/app/services/station.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  private animationInterval: NodeJS.Timeout;
  continueWithPhone: boolean;

  constructor(
    private loadingService: LoadingService,
    private router: Router,
    private toastService: ToastService,
    private auth: Auth,
    private userService: UserService,
    private localDbService: LocalDbService,
    private stationService: StationService
  ) { /**/}

  ngOnInit() {
    setTimeout(() => {
      const contAnimation = document.querySelector('.js-animation');
      let cont = 0;
      const titles = contAnimation.querySelectorAll('h1');
      this.animationInterval = setInterval(() => {
        contAnimation.classList.add('h-0');
        setTimeout(() => {
          titles[cont].classList.add('d-none');
          cont++;
          if (cont + 1 === titles.length) { cont = 0; }
          titles[cont].classList.remove('d-none');
          contAnimation.classList.remove('h-0');
        }, 500);
      }, 5000);

    }, 220);
  }

  skipRegister(){
    this.loadingService.present('Creando usuario...');

    signInAnonymously(this.auth)
      .then(() => {
        this.loadingService.dismiss();
        clearInterval(this.animationInterval);
        this.router.navigate([Route.Register]);
      })
      .catch((e) => {
        console.log(e)
        this.loadingService.dismiss();
          this.toastService.presentToast('Error al tratar de continuar', Colors.DANGER, 5000);
      });
  }

  checkUserState(data: FirebaseUISignInSuccessWithAuthResult) {
    this.loadingService.present();
    this.userService.getUser(data.authResult.user.uid)
      .then(user => {
        this.loadingService.dismiss();

        if (!user){
          this.router.navigate([Route.Register]);
        }else{
          this.localDbService.setUserData(user.id, user)
            .then(() => {
              this.userService.syncUser(user.id)
                .then(() => {
                  this.router.navigate(['radio/']);
                })
                .catch((e) => {
                  console.log(e)
                  this.toastService.presentToast('Ha ocurrido un error de conexión', Colors.DANGER, 2500);
                })
            }).catch(e => console.log(e));
        }
        this.loadingService.dismiss();
      })
      .catch((e) => {
        console.log(e)
        this.loadingService.dismiss();
          this.toastService.presentToast('Ha ocurrido un error', Colors.DANGER, 2500);
      });
  }
}
