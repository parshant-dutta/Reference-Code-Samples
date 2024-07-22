import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
   TOKEN_KEY = 'auth_token';
  constructor() { }
  
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (token) {
      return true;
    }
    return false;
  }

  // Get Token using key
  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  // Set token in session storage 
  setToken(token: string): void {
    sessionStorage.setItem(this.TOKEN_KEY, token);
  }

  // Clear/Remove Token form session Storege
  removeToken(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
  }
}
