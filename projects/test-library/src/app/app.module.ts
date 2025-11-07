import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { CommonModule, DatePipe } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';

import { ReactiveFormsModule } from '@angular/forms';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from "projects/base/src/shared/shared.module";
import { SellsListComponent } from './sales/sells-list/sells-list.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { CurrencySymbolPipe } from 'projects/base/src/shared/Utils/currency-simbol-pipe';
import { AmountFormatPipe } from 'projects/base/src/shared/Utils/amount-format-pipe.pipe';
import { SellDetailComponent } from './sales/sell-detail/sell-detail.component';
import { CustomDatePipe } from 'projects/base/src/shared/Utils/pipeCustomDate';
import { InvopayModule } from './invopay/invopay.module';
import { HomeComponent } from './invopay/views/home/home.component';
import { RevenueListComponent } from './revenues/revenue-list/revenue-list.component';
import { RevenueDetailComponent } from './revenues/revenue-detail/revenue-detail.component';
import { TokenInterceptor } from './invopay/services/token.interceptor';
import { PaymentsEntitiesListComponent } from './payments/payments-entities-list/payments-entities-list.component';
import { AdditionalFiltersModalComponent } from './shared/components/additional-filters-modal/additional-filters-modal.component';
import { MobileDateFiltersModalComponent } from './shared/components/mobile-date-filters-modal/mobile-date-filters-modal.component';
import { InsuranceNotificationTrayComponent } from './notifications/insurance/insurance-notification-tray/insurance-notification-tray.component';
import { NotificationTrayComponent } from './shared/components/notification-tray/notification-tray.component';
import { NotificationModalComponent } from './shared/components/notification-modal/notification-modal.component';
import { BrokerNotificationTrayComponent } from './notifications/brokers/broker-notification-tray/broker-notification-tray.component';



  export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
  }


import { DecryptionService } from './shared/services/decryption.service';
import { DecryptionInterceptor } from './shared/interceptors/decryption.interceptor';




@NgModule({
  declarations: [AppComponent,SellsListComponent,NavbarComponent,SidebarComponent,MainLayoutComponent, SellDetailComponent, RevenueListComponent, RevenueDetailComponent, PaymentsEntitiesListComponent, InsuranceNotificationTrayComponent, NotificationTrayComponent, NotificationModalComponent, BrokerNotificationTrayComponent],

  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot({
      defaultLanguage: 'es',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    InvopayModule,
    AdditionalFiltersModalComponent,
    MobileDateFiltersModalComponent,
    SharedModule
  ],
  providers: [DatePipe,AmountFormatPipe,CurrencySymbolPipe,CustomDatePipe,DecryptionService,
  {provide:HTTP_INTERCEPTORS,
  useClass:TokenInterceptor,
  multi:true
  },
  {
    provide: HTTP_INTERCEPTORS,
    useClass: DecryptionInterceptor,
    multi: true
  }],
  bootstrap: [AppComponent],
})
export class AppModule { }

