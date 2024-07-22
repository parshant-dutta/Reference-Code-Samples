import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthenticationModule } from './authentication/authentication.module';
import { MaterialModule } from './ui/material.module';
import { DashboradComponent } from './feature/dashborad/dashborad.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MainLayoutComponent } from './layout/layout.component';
import { SidebarComponent } from './layout/main-layout/sidebar/sidebar.component';
import { HeaderComponent } from './layout/main-layout/header/header.component';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { LoaderInterceptor } from './core/interceptors/loader.interceptors';
import { provideToastr, ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [
    AppComponent,
    DashboradComponent,
    MainLayoutComponent,
    SidebarComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AuthenticationModule,
    MaterialModule,
    ToastrModule.forRoot({
      closeButton: true,
      timeOut: 15000, // 15 seconds
      progressBar: true,
    }),
    
    
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoaderInterceptor,
      multi: true,
    },
   
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
