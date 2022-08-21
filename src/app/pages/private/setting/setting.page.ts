import { Component, OnInit, } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';
import { RecaptchaVerifier, ConfirmationResult, Auth, signInWithPhoneNumber, PhoneAuthProvider, user, linkWithCredential } from "@angular/fire/auth";
import { LoadingService } from 'src/app/services/loading.service';
import { AlertController } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage implements OnInit {

  verification = false;
  recaptchaVerifier: RecaptchaVerifier;
  confirmationResult: ConfirmationResult;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates];
  connectedAccount = false;
  
  form = this.fb.group({
    phone: ['', [Validators.required]]
  });

  get phone() { return this.form.get('phone'); }

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private loadingService: LoadingService,
    private alertController: AlertController,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    if (this.auth.currentUser.phoneNumber) {
      this.connectedAccount = true;
    } else {
      this.connectedAccount = false;
    }
  }

  async ionViewDidEnter() {
    this.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
      size: 'invisible'
    }, this.auth);
  }

  ionViewDidLoad() {
    this.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
      size: 'invisible'
    }, this.auth);
  }

  verifyPhone() {
    if (this.form.valid) {
      this.loadingService.present();signInWithPhoneNumber
      signInWithPhoneNumber(this.auth, this.phone.value.e164Number, this.recaptchaVerifier)
        .then(async (confirmationResult) => {
          this.confirmationResult = confirmationResult;
          this.loadingService.dismiss();
          this.presentAlert();
        }).catch(() => {
          this.loadingService.dismiss();
          this.toastService.presentToast('No se pudo enviar el código de verificación');
        });
    } else {
      if (this.phone?.errors?.required) {
          this.toastService.presentToast('El número de teléfono es requerido');
      }
    }
  }

  async presentAlert() {

    const alert = await this.alertController.create({
      header: 'Ingresa el código de verificación',
      backdropDismiss: false,
      inputs: [
        {
          name: 'otp',
          type: 'text',
          placeholder: 'Código de verificación',
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: 'Verificar',
          handler: async (res) => {
            user(this.auth)
              .subscribe(resp => {
                const credential = PhoneAuthProvider.credential(this.confirmationResult.verificationId, res.otp);
    
                linkWithCredential(resp, credential).then(() => {
                  this.connectedAccount = true;
                }).catch(() => {
                  this.loadingService.dismiss();
                  this.toastService.presentToast('Código de verificación incorrecto');
                  this.presentAlert();
                });
              });
          }
        }
      ]
    });
    await alert.present();
  }
}
