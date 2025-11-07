import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Enviroment } from '../../../enviroment/Enviroment';
import { SellsListState } from '../../../shared/models/saleFilters';
import { SaleDetail } from '../../models/Sale-detail';
import { SalesResponse } from '../../models/Sales';
@Injectable({
  providedIn: 'root'
})
export class SellService {

constructor() { }
private readonly http=inject(HttpClient);
private state:SellsListState | null=null;

saveState(state: SellsListState): void {
    this.state = state;
  }

  getState(): SellsListState | null {
    return this.state;
  }

  clearState(): void {
    this.state = null;
  }

  hasState(): boolean {
    return this.state !== null;
  }

getSales():Observable<SalesResponse[]>{ 
  return this.http.get<SalesResponse[]>(`${Enviroment.apiSale}`)
  }
  getSaleById(id:number):Observable<SaleDetail>{
   
    return this.http.get<SaleDetail>(`${Enviroment.apiSale}/${id}`)
  }
}
