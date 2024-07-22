import { AbstractControl } from '@angular/forms';

export function ValidateUrl(control: AbstractControl) {
  if (!control.value.startsWith('https://') || !control.value.includes('.io')) {
    return { validUrl: true };
  }
  return null;
}

export function emailDomain (control: AbstractControl): {[key: string]: any} | null {
  const email: string = control.value;
  const domain = email.substring(email.lastIndexOf('@') + 1);
  if(email === '' || domain.toLowerCase()=== 'gmail.com') {
    return null;
  } else {
    return {'emailDomain': true}
  }
}