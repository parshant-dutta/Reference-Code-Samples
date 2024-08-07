import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserListComponent } from './components/user-list/user-list.component';
import { AddUserComponent } from './components/add-user/add-user.component';

const routes: Routes = [
  { 
    path: '', 
    component: UserListComponent
  },  
  { 
    path: 'add', 
    component: AddUserComponent 
  },
  {
    path: 'edit/:id',
    component: AddUserComponent
  } 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
