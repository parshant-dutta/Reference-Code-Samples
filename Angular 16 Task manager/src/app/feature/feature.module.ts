import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeatureRoutingModule } from './feature-routing.module';
import { TasklistComponent } from './tasklist/tasklist.component';
import { MaterialModule } from '../ui/material.module';
import { TaskDetailComponent } from './task-detail/task-detail.component';
import { FormsModule } from '@angular/forms';
import { AngularEditorModule } from '@kolkov/angular-editor';


@NgModule({
  declarations: [
    TasklistComponent,
    TaskDetailComponent
  ],
  imports: [
    CommonModule,
    FeatureRoutingModule,
    MaterialModule,
    FormsModule,
    AngularEditorModule
  ],
})
export class FeatureModule { }
