import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { RegisterService } from './register.service';
import { LocalStorageService } from '../../shared/Services/local-storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  formErrors = {
    'name': '',
    'email': '',
    'password': '',
    'confirmpassword': '',
    'dateofbirth': ''
  }
  validationMessage = {
    'name': {
      'required': 'Name is required'
    },
    'email': {
      'email': 'Enter valid email',
      'required': 'Email is required'
    },
    'password': {
      'required': 'Password is required'
    },
    'confirmpassword': {
      'required': 'Confirm password is required',
      'notEquivalent':'Password and confirm password are not same'
    },
    'dateofbirth': {
      'required': 'Date of birth is required'
    }
  }
  registerform = this.fb.group({
    name: ['', Validators.required],
    email: ['',[Validators.required, Validators.email]],
    password: ['', Validators.required],
    confirmpassword: [''],
    dateofbirth: ['', Validators.required],
    authenticationFlag: true,
    authenticationMessage: ['']
  },
  {validator: this.checkIfMatchingPasswords('password', 'confirmpassword')}
  );

  constructor(private _service: RegisterService, private _localStorageService: LocalStorageService, 
    private fb: FormBuilder, private router: Router) { 
    }

  ngOnInit() {
  }

  checkIfMatchingPasswords(passwordKey: string, passwordConfirmationKey: string) {
    return (group: FormGroup) => {
      let passwordInput = group.controls[passwordKey],
          passwordConfirmationInput = group.controls[passwordConfirmationKey];
      if (passwordInput.value !== passwordConfirmationInput.value) {
        return passwordConfirmationInput.setErrors({notEquivalent: true});
      }
      else {
          return passwordConfirmationInput.setErrors(null);
      }
    }
  }

  LogValidationError(group: FormGroup = this.registerform): void {
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
    this._service.submit(this.registerform.value).subscribe((response: any) => {
      this._localStorageService.storeAuthToken(response.token);
      this.registerform.patchValue({
        authenticationMessage: {'message':''},
        authenticationFlag: true
      });
      this.router.navigateByUrl('/dashboard');
    }, (error: any) => {
      if(error.error.StatusCode)
      {
        this.registerform.patchValue({
          authenticationMessage: {'message':error.error.Message},
          authenticationFlag: false
        });
      } else {
        this.registerform.patchValue({
          authenticationMessage: error.error,
          authenticationFlag: false
        });
      }
    });
  }

}
