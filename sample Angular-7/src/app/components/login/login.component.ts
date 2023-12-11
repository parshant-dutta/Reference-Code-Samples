import { Component, OnInit, Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoginService } from './login.service';
import { LocalStorageService } from '../../shared/Services/local-storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {
  formErrors = {
    'email': '',
    'password': ''
  }
  validationMessage = {
    'email': {
      'email': 'Enter valid email',
      'required': 'Email is required'
    },
    'password': {
      'required': 'Password is required'
    }
  }
  loginform = this.fb.group({
    email: ['',[Validators.required, Validators.email]],
    password: ['', Validators.required],
    authenticationFlag: true,
    authenticationMessage: ['']
  }
  );
  constructor(private fb: FormBuilder, private _service: LoginService
    , private _localStorageService: LocalStorageService, private router: Router){
  }

  ngOnInit() {
  }

  LogValidationError(group: FormGroup = this.loginform): void {
    Object.keys(group.controls).forEach((key: string) => {
      const controlConst = group.get(key);
      this.formErrors[key] = '';
      if (controlConst && controlConst.invalid &&
        (controlConst.touched || controlConst.dirty)) {
        const errorMessage = this.validationMessage[key];
        for (const errorKey in controlConst.errors) {
          if (errorKey) {
            this.formErrors[key] += errorMessage[errorKey] + '';
          }
        }
      }
      if (controlConst instanceof FormGroup) {
        this.LogValidationError(controlConst);
      }
    }
    )
  }

  onSubmit(): void {
    this._service.submit(this.loginform.value).subscribe((response: any) => {
      this._localStorageService.storeAuthToken(response.token);
      this.loginform.patchValue({
        authenticationMessage: {'message':''},
        authenticationFlag: true
      });
      this.router.navigate(['/dashboard',{Component: JSON.stringify(response)}]);
    }, (error: any) => {
      if(error.error.StatusCode)
      {
        this.loginform.patchValue({
          authenticationMessage: {'message':error.error.Message},
          authenticationFlag: false
        });
      } else {
        this.loginform.patchValue({
          authenticationMessage: error.error,
          authenticationFlag: false
        });
      }
    });
  }

}
