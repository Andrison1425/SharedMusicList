import { Router } from '@angular/router';
import { LoadingService } from './../../../services/loading.service';
import { UserService } from './../../../services/user.service';
import { ToastService } from './../../../services/toast.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Colors } from 'src/app/enums/color.enum';
import { Auth } from '@angular/fire/auth';


@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  userDataForm: FormGroup = this.fb.group({
    userName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
  });

  get userName() { return this.userDataForm.get('userName'); }

  constructor(
    private fb: FormBuilder,
    private toastService: ToastService,
    private router: Router,
    private userService: UserService,
    private loading: LoadingService,
    private auth: Auth
  ) { }

  ngOnInit() {
    //
  }

  completeUserRegister() {
    if(this.formValidate()) {
      this.loading.present('Creando usuario...');

      this.userService.createUser({
        id: this.auth.currentUser.uid,
        userName: this.userName.value
      }).then(() => {
        this.loading.dismiss();
        this.router.navigate(['radio/']);
      }).catch(() => {
        this.loading.dismiss();
        this.toastService.presentToast('Ha ocurrido un error', Colors.DANGER);
      })
    }
  }

  formValidate() {
    if(this.userName?.errors?.required) {
      this.toastService.presentToast('El nombre de usuario es obligatorio', Colors.DANGER);
      return false;
    }

    if(this.userName?.errors?.minlength){
      this.toastService.presentToast('El nombre de usuario debe de ser de 3 caracteres mínimo', Colors.DANGER, 5000);
      return false;
    }

    return true;
  }
}
