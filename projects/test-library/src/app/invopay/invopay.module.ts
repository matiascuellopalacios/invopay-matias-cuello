import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { IpLoginComponent } from './components/ip-login/ip-login.component';

import { IpAuthService } from './services/ip-auth.service';
import { IpProfileService } from './services/ip-profile.service';
import { IpSnackbarService } from './services/ip-snackbar.service';

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { InvopayRoutingModule } from './invopay-routing.module';
import { DecryptionInterceptor } from './services/decryption.interceptor';
import { DecryptionService } from './services/decryption.service';
import { TokenInterceptor } from './services/token.interceptor';


@NgModule({
    declarations: [
        IpLoginComponent
    ],
    imports: [
        CommonModule,
        HttpClientModule,
        InvopayRoutingModule,
        ReactiveFormsModule,
        TranslateModule,
        MatSnackBarModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        RouterModule,
    ],
    providers: [
        IpAuthService,
        IpProfileService,
        IpSnackbarService,
        DecryptionService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: DecryptionInterceptor,
            multi: true
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptor,
            multi: true,
        },
    ],
    exports: [
        IpLoginComponent
    ]
})
export class InvopayModule { }