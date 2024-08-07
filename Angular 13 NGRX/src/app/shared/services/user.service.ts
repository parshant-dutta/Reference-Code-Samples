import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from 'src/app/shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }
  private apiUrl = 'http://localhost:3000/users';

  addUser(data: User[]) {
    return this.http.post(this.apiUrl, data);
  }

  getUser() {
    return this.http.get(this.apiUrl);
  }

  deleteUser(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  editUser(id: string, data: User[] ) {
    return this.http.patch(`${this.apiUrl}/${id}`, data);
  }

}
