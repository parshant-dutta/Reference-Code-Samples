import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  LOCALSTORAGE_TOKEN_KEY: string = 'AuthToken';
  constructor() { }

  storeAuthToken(token) {
    localStorage.setItem(this.LOCALSTORAGE_TOKEN_KEY, token);
  }

  removeAuthToken() {
    localStorage.removeItem(this.LOCALSTORAGE_TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    if(localStorage.getItem(this.LOCALSTORAGE_TOKEN_KEY)) {
      return true;
    }
    return false;
  }

}
