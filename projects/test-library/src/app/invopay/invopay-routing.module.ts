import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { IpLoginComponent } from './components/ip-login/ip-login.component';
import { AuthGuard } from './guards/auth.guard';

import { MainLayoutComponent } from '../layout/main-layout/main-layout.component';
import { HomeComponent } from './views/home/home.component';
import { SellsListComponent } from '../sales/sells-list/sells-list.component';
import { SellDetailComponent } from '../sales/sell-detail/sell-detail.component';
import { RevenueListComponent } from '../revenues/revenue-list/revenue-list.component';
import { RevenueDetailComponent } from '../revenues/revenue-detail/revenue-detail.component';
import { PaymentsEntitiesListComponent } from '../payments/payments-entities-list/payments-entities-list.component';
import { InsuranceNotificationTrayComponent } from '../notifications/insurance/insurance-notification-tray/insurance-notification-tray.component';
import { BrokerNotificationTrayComponent } from '../notifications/brokers/broker-notification-tray/broker-notification-tray.component';

import { Template1Component } from './views/template1/template1.component';


const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivateChild: [AuthGuard],
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
      },
      {
        path: 'insurance-notification-tray',
        component: InsuranceNotificationTrayComponent
      },
      {
        path: 'broker-notification-tray',
        component: BrokerNotificationTrayComponent
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
  },
  {
    path: 'revenues',
    component: Template1Component
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvopayRoutingModule { }
