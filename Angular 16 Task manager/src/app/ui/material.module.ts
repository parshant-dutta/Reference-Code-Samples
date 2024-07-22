import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { NgFor } from '@angular/common';
import {DragDropModule} from '@angular/cdk/drag-drop';

import { MatSelectModule } from '@angular/material/select'
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatListModule} from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatMenuModule} from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';

import {ScrollingModule} from '@angular/cdk/scrolling';
import {CdkTableModule} from '@angular/cdk/table';
import {CdkTreeModule} from '@angular/cdk/tree';
import { SharedModule } from '../shared/shared.module';
const module = [
  MatCheckboxModule,MatTooltipModule,
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  MatSlideToggleModule,
  MatProgressSpinnerModule,
  MatDialogModule,
  MatChipsModule,
  NgFor,
  MatTabsModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatSelectModule, MatCheckboxModule,MatAutocompleteModule,
  MatFormFieldModule,
  MatIconModule,
  MatButtonModule,
  MatCardModule,
  MatListModule,
  DragDropModule,  CdkTableModule,
    CdkTreeModule,
    ScrollingModule,MatToolbarModule,
    MatMenuModule,
    MatSidenavModule,
    // SharedModule
    
]
@NgModule({

  imports: [
    ...module
  ],
  exports: [
    ...module
  ]
})
export class MaterialModule { }
