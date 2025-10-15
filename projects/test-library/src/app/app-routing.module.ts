import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BaseComponent } from 'base';
import { HomeComponent } from './invopay/views/home/home.component';
import { SellsListComponent } from './invopay/components/sells-list/sells-list.component';
import { SellDetailComponent } from './invopay/components/sell-detail/sell-detail.component';
import { IpLoginComponent } from './invopay/components/ip-login/ip-login.component';
import { RevenueListComponent } from './invopay/components/revenue-list/revenue-list.component';
import { RevenueDetailComponent } from './invopay/components/revenue-detail/revenue-detail.component';
import { PaymentsEntitiesListComponent } from './invopay/components/payments-entities-list/payments-entities-list.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: IpLoginComponent,
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path:'login',
    component:IpLoginComponent
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
   
    path: 'invopay',
    loadChildren: () =>
      import('./invopay/invopay.module').then((m) => m.InvopayModule),
  },
  {
   path:'sell-list',
    component:SellsListComponent
  },
  {
    path:'sale-detail',
    component:SellDetailComponent
  },
  {
    path:'revenue-list',
    component:RevenueListComponent
  },
  {
    path:'revenue-detail',
    component:RevenueDetailComponent
  },
  {
    path:'payments-entities',
    component:PaymentsEntitiesListComponent
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
