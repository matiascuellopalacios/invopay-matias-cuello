import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { CommonModule, DatePipe } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { SharedModule } from "projects/base/src/shared/shared.module";
import { SellsListComponent } from './invopay/components/sells-list/sells-list.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { CurrencySymbolPipe } from 'projects/base/src/shared/Utils/currency-simbol-pipe';
import { AmountFormatPipe } from 'projects/base/src/shared/Utils/amount-format-pipe.pipe';
import { SellDetailComponent } from './invopay/components/sell-detail/sell-detail.component';
import { CustomDatePipe } from 'projects/base/src/shared/Utils/pipeCustomDate';
import { InvopayModule } from './invopay/invopay.module';
import { HomeComponent } from './invopay/views/home/home.component';
import { RevenueListComponent } from './invopay/components/revenue-list/revenue-list.component';
import { RevenueDetailComponent } from './invopay/components/revenue-detail/revenue-detail.component';
import { TokenInterceptor } from './invopay/services/token.interceptor';
import { PaymentsEntitiesListComponent } from './invopay/components/payments-entities-list/payments-entities-list.component';


  export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
  }


@NgModule({
  declarations: [AppComponent, HomeComponent,SellsListComponent,NavbarComponent,SidebarComponent, SellDetailComponent, RevenueListComponent, RevenueDetailComponent, PaymentsEntitiesListComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    HttpClientModule,
    TranslateModule.forRoot({
      defaultLanguage: 'es',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    InvopayModule,
    SharedModule
  ],
  providers: [DatePipe,AmountFormatPipe,CurrencySymbolPipe,CustomDatePipe,
  {provide:HTTP_INTERCEPTORS,
  useClass:TokenInterceptor,
  multi:true

  }],
  bootstrap: [AppComponent],
})
export class AppModule { }

