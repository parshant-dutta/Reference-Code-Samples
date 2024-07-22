import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../service/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {

    constructor(
      private authService: AuthService,
      private router: Router
    ){
    }
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
      const authenticated = this.authService.isAuthenticated();

      if (authenticated) {
        return true; // User is authenticated, allow access to the route
      } else {
        // User is not authenticated, redirect to the login page
        this.router.navigate(['/auth/login']);
        return false;
      }
    }
};
