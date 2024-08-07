import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';

const modules = [
  MatInputModule,
  MatFormFieldModule,
  MatButtonModule,
  MatTableModule,
  MatIconModule,
  MatCardModule,
  MatDatepickerModule,
  MatSidenavModule,
  MatListModule,
  MatToolbarModule 
]

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    modules
  ],
  exports: [modules]
})
export class MaterialModule { }
