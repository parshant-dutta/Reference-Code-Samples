import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule } from '@angular/router';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { WidgetsComponent } from './components/widgets/widgets.component';

@NgModule({
  declarations: [WidgetsComponent],
  imports: [
    CommonModule,
    Ng2GoogleChartsModule,
    SharedModule,
    RouterModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }
