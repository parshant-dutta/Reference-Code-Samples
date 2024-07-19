import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApisService {

  constructor(public http: HttpClient) { }


   // url = 'http://localhost:3002/files';

  //  Add Sign Up Form Data  in db.json
   postSignupData(item: any) {
    return this.http.post('http://localhost:3000/signupuser/data', item);
  }

  // Get Sign Up User data/List
  getUserData() {
    return this.http.get('http://localhost:3000/signupuser');
  }

// Get Task Liast
getTaskList() {
  return this.http.get('http://localhost:3000/getTasklist');
}

// Add task in db.json
postTaskList(item: any) {
  return this.http.post('http://localhost:3000/getTasklist', item);
}

// Edit/Update  Task List 
  updataTask(id: any, item: any) {

    return this.http.patch(`http://localhost:3000/getTasklist/${id}`, item);
  }

  
  // Get Delete Task
  deleteTask(id: any) {
    // return this.http.delete(this.adminApi + "deleteUser" + "/" + id);
    return this.http.delete('http://localhost:3000/getTasklist' + "/" + id);

  }

  // Get Particular  Task Detail 
  getDetail(id: any) {

    return this.http.get(`http://localhost:3000/getTasklist/${id}`);
  }
}
