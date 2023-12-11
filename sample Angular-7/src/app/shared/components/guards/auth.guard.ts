import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LocalStorageService } from '../../Services/local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private _authenticationService: LocalStorageService, private router: Router){}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      const status = this._authenticationService.isAuthenticated();

      if (status) {
        return true;
      }

      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
      return false;
  }
}
