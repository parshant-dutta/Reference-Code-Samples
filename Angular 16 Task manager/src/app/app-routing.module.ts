import { MainLayoutComponent } from './layout/layout.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { UnauthGuard } from './core/guards/unauth.guard';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./authentication/authentication.module').then((m) => m.AuthenticationModule),
    canActivate: [UnauthGuard],
  },

  
  {
    path:'',
    component:MainLayoutComponent,
    children:[
      {
        path:"",
        loadChildren:()=> import("./feature/feature.module").then((m)=> m.FeatureModule)
      }
      
    ],
    canActivate: [AuthGuard],
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
