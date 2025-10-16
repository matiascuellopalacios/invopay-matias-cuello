import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { IpLoginComponent } from './components/ip-login/ip-login.component';
import { AuthGuard } from './guards/auth.guard';
import { MainLayoutComponent } from '../layout/main-layout/main-layout.component';
import { HomeComponent } from './views/home/home.component';
import { SellsListComponent } from './components/sells-list/sells-list.component';
import { SellDetailComponent } from './components/sell-detail/sell-detail.component';
import { RevenueListComponent } from './components/revenue-list/revenue-list.component';
import { RevenueDetailComponent } from './components/revenue-detail/revenue-detail.component';
import { PaymentsEntitiesListComponent } from './components/payments-entities-list/payments-entities-list.component';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        component: HomeComponent,
      },
      {
        path: 'sell-list',
        component: SellsListComponent
      },
      {
        path: 'sale-detail',
        component: SellDetailComponent
      },
      {
        path: 'revenue-list',
        component: RevenueListComponent
      },
      {
        path: 'revenue-detail',
        component: RevenueDetailComponent
      },
      {
        path: 'payments-entities',
        component: PaymentsEntitiesListComponent
      }
    ]
  },
  {
    path: 'login-admin',
    component: IpLoginComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'login-broker',
    component: IpLoginComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvopayRoutingModule { }
