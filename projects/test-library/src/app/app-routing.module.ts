import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BaseComponent } from 'base';
import { IpLoginComponent } from './invopay/components/ip-login/ip-login.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: IpLoginComponent,
  },
  {
    path: 'login',
    component: IpLoginComponent
  },
  {
    path: 'invopay',
    loadChildren: () =>
      import('./invopay/invopay.module').then((m) => m.InvopayModule),
  },
  {
    path: 'library',
    children: [
      {
        path: 'base',
        component: BaseComponent,
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
