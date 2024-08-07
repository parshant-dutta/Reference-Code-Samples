import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { UserReducer } from './store/reducers/user.reducer';
import { UserEffects } from './store/effects/user.effect';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';
import { LineChartComponent } from './components/line-chart/line-chart.component';
import { BarChartComponent } from './components/bar-chart/bar-chart.component';
import { PieChartComponent } from './components/pie-chart/pie-chart.component';
import { ColumnChartComponent } from './components/column-chart/column-chart.component';
import { MaterialModule } from './material.module';

@NgModule({
  declarations: [
    LineChartComponent,
    BarChartComponent,
    PieChartComponent,
    ColumnChartComponent],
  imports: [
    CommonModule,
    Ng2GoogleChartsModule,
    MaterialModule,
    StoreModule.forFeature('users', UserReducer),
    EffectsModule.forFeature([UserEffects])
  ],
  exports: [
    MaterialModule,
    LineChartComponent,
    BarChartComponent,
    PieChartComponent,
    ColumnChartComponent
  ]
})
export class SharedModule { }
