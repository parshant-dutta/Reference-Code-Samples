import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/service/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  userName: any = ''
  constructor(private authservice: AuthService, private router: Router) {
    this.userName = sessionStorage.getItem('userName');
  }


  // log out user and clear session storage
  logOut() {
    this.authservice.removeToken();
    this.router.navigateByUrl('/login');

  }
}
