import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ApisService } from 'src/app/core/service/apis.service';
import { AuthService } from 'src/app/core/service/auth.service';
import { emailDomain } from 'src/app/shared/component/diraectives/validator';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent {
  signupForms!: FormGroup;

  constructor(private fb: FormBuilder, private authservice: AuthService, private apisservice: ApisService, private router: Router, public toastrService: ToastrService) {
    this.signupForms = this.fb.group({
      username: new FormControl("", [Validators.required]),
      phone: new FormControl("", [Validators.required]),
      email: ["", [Validators.required, Validators.email, emailDomain]],
      password: new FormControl("", [Validators.required]),
      c_password: new FormControl("", [Validators.required]),

    });
  }

  // sign up user data store db.json using api 
  signUp() {
    this.signupForms.markAllAsTouched();
    const data = {
      username: this.signupForms.value.username,
      phone: this.signupForms.value.username,
      email: this.signupForms.value.username,
      password: this.signupForms.value.password,
      c_password: this.signupForms.value.c_password,
    }
    this.apisservice.postSignupData(data).subscribe((res: any) => {
      this.router.navigateByUrl('login');
      this.toastrService.success('SignUp Success!', 'Title Success!');


    })
  }
}
