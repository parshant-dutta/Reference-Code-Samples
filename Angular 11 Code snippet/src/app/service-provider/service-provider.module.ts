import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServiceProviderRoutingModule } from './service-provider-routing.module';
import { DefaultDashboardComponent } from './components/default-dashboard/default-dashboard.component';


@NgModule({
  declarations: [
    DefaultDashboardComponent
  ],
  imports: [
    CommonModule,
    ServiceProviderRoutingModule
  ]
})
export class ServiceProviderModule { }
