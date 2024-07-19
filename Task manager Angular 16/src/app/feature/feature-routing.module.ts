import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboradComponent } from './dashborad/dashborad.component';
import { TaskDetailComponent } from './task-detail/task-detail.component';
import { TasklistComponent } from './tasklist/tasklist.component';

const routes: Routes = [
  {
    path:'dashborad',
    component:DashboradComponent,
    data:{
      title:'DashBoard'
    }
  },
  {
    path:'tasklist',
    component:TasklistComponent,
    data:{
      title:'Task List'
    }
  },
  {
    path:"taskdetail/:id",
    component:TaskDetailComponent,
    data:{
      title:'Task Detail'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeatureRoutingModule { }
