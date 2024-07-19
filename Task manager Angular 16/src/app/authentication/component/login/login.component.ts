import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApisService } from 'src/app/core/service/apis.service';
import { AuthService } from 'src/app/core/service/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForms!: FormGroup;
  username: any;
  password: any;
  token: string = "adsfhjdhsaflhljafhasdjlfh"
  constructor(private fb: FormBuilder, private authservice: AuthService, private apiservice: ApisService, private router: Router, public toastrService: ToastrService) {
    this.loginForms = this.fb.group({
      username: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(4)]],
    });
  }
  ngOnInit() {
    this.fetchUserData();
  }

  userData: any = [];

  // Get User list 
  fetchUserData() {
    this.apiservice.getUserData().subscribe((res: any) => {
      this.userData = res;
    });
  }

  // Check login user in sign up or not using api
  login() {
    this.loginForms.markAllAsTouched();

    let userName = this.loginForms.value.username;
    let passWord = this.loginForms.value.password;
    sessionStorage.setItem("userName", userName);
    const user = this.userData.find((x: any) => x.username === userName && x.password === passWord);

    if (user) {
      this.authservice.setToken(this.token);
      this.router.navigateByUrl('dashborad');
      this.toastrService.success('Login Success!', 'Title Success!');

    } else {
      this.toastrService.error('Invalid credential!', 'Title Error!');



    }
  }
}
