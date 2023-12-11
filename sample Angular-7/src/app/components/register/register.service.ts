import { Injectable } from '@angular/core';
import{HttpClient, HttpHeaders} from'@angular/common/http';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  constructor(private http :HttpClient) { }

  submit(data){
    debugger;
    return this.http.post(environment.apiUrl + '/AuthAPI/Register', JSON.stringify(data), {
      headers:new HttpHeaders({
          'Content-Type':'application/json'
      })
    });
  }

}
