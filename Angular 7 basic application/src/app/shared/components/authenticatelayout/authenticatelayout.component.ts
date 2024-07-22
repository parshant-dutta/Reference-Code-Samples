import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from '../../Services/local-storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-authenticatelayout',
  templateUrl: './authenticatelayout.component.html',
  styleUrls: ['./authenticatelayout.component.scss']
})
export class AuthenticatelayoutComponent implements OnInit {

  constructor(private _localStorageService: LocalStorageService, private router: Router) { }

  ngOnInit() {
  }

  logout(): void{
    this._localStorageService.removeAuthToken();
    this.router.navigateByUrl('/login');
  }

}
