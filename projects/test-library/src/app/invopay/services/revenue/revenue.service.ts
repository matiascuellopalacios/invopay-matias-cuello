import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Enviroment } from '../../../enviroment/Enviroment';
import { RevenueListState } from '../../interface/saleFilters';
import { RevenueResponse } from '../../interface/Revenue';
import { ConciliationResponse } from '../../interface/RevenueDetail';
@Injectable({
  providedIn: 'root'
})
export class RevenueService {

constructor() { }
private readonly http=inject(HttpClient);
private state:RevenueListState | null=null;

saveState(state: RevenueListState): void {
    this.state = state;
  }

  getState(): RevenueListState | null {
    return this.state;
  }

  clearState(): void {
    this.state = null;
  }

  hasState(): boolean {
    return this.state !== null;
  }


getAllRevenue():Observable<RevenueResponse[]>{
return this.http.get<RevenueResponse[]>(`${Enviroment.apiRenueve}`);
}
getRevenueById(id:number):Observable<ConciliationResponse>{
  //const headers = new HttpHeaders({
  //  Authorization: `Bearer ${this.token}`
 // });
  return this.http.get<ConciliationResponse>(`${Enviroment.apiRenueve}/${id}`);//,{ headers })
}
}
