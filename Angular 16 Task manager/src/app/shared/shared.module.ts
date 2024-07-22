import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddEditTaskComponent } from './component/dailogs/add-edit-task/add-edit-task.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialModule } from '../ui/material.module';
import { DeleteTaskComponent } from './component/dailogs/delete-task/delete-task.component';
import { AngularEditorModule } from '@kolkov/angular-editor';



@NgModule({
  declarations: [
    AddEditTaskComponent,
    DeleteTaskComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    AngularEditorModule
  ]
})
export class SharedModule { }
