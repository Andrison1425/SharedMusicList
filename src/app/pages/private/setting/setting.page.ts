import { Component, OnInit, ViewChild, } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { RecaptchaVerifier, ConfirmationResult, Auth, signInWithPhoneNumber, PhoneAuthProvider, user, linkWithCredential } from "@angular/fire/auth";
import { LoadingService } from 'src/app/services/loading.service';
import { AlertController } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast.service';
import * as intlTelInput from 'intl-tel-input';
import { LocalDbService } from 'src/app/services/local-db.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage implements OnInit {

  verification = false;
  recaptchaVerifier: RecaptchaVerifier;
  confirmationResult: ConfirmationResult;
  connectedAccount = false;
  intTelRef: intlTelInput.Plugin;
  @ViewChild('telInput', { static: false }) telInput;
  form = this.fb.group({
    phone: ['', [Validators.required]]
  });

  get phone() { return this.form.get('phone'); }

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private loadingService: LoadingService,
    private alertController: AlertController,
    private toastService: ToastService,
    private localDbService: LocalDbService
  ) { }

  ngOnInit() {
    if (this.auth.currentUser.phoneNumber) {
      this.connectedAccount = true;
    } else {
      this.connectedAccount = false;
    }

    const interval = setInterval(() => {
      if (this.telInput) {
        this.intTelRef = intlTelInput(this.telInput.nativeElement, {
          customPlaceholder: (selectedCountryPlaceholder, selectedCountryData) => "e.j. " + selectedCountryPlaceholder,
          initialCountry: this.localDbService.user.location.countryCode,
          separateDialCode: true
        });
        clearInterval(interval);
      }
    }, 200)
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
    //console.log(this.intTelRef.getNumber());
    // if (this.form.valid) {
    //   this.loadingService.present();signInWithPhoneNumber
    //   signInWithPhoneNumber(this.auth, this.phone.value.e164Number, this.recaptchaVerifier)
    //     .then(async (confirmationResult) => {
    //       this.confirmationResult = confirmationResult;
    //       this.loadingService.dismiss();
    //       this.presentAlert();
    //     }).catch(() => {
    //       this.loadingService.dismiss();
    //       this.toastService.presentToast('No se pudo enviar el código de verificación');
    //     });
    // } else {
    //   if (this.phone?.errors?.required) {
    //       this.toastService.presentToast('El número de teléfono es requerido');
    //   }
    // }
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
