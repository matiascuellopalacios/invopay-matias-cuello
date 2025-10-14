import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Enviroment } from '../../../enviroment/Enviroment';
import { PaymentProviderPageResponse } from '../../interface/paymentEntities';

@Injectable({
  providedIn: 'root'
})
export class ProvidersService {

constructor() { }
  private readonly http=inject(HttpClient);

  getPaymentsEntities():Observable<PaymentProviderPageResponse>{
    return this.http.get<PaymentProviderPageResponse>(`${Enviroment.apiProviders}`);
  }
}
