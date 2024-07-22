import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../service/auth.service';


@Injectable({ providedIn: 'root' })
export class UnauthGuard implements CanActivate {
  constructor(private router: Router, private  authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const isLoggedIn = this.authService.isAuthenticated();
    if (!isLoggedIn) { return true; }

    this.router.navigateByUrl('/dashborad');
    return false;
  }
}
