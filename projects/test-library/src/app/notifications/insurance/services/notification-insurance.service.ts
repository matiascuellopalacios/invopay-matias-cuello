import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Notification, NotificationRead } from '../../../shared/models/notificationResponse';
import { Enviroment } from '../../../enviroment/Enviroment';
import { Broker } from '../../brokers/models/broker';

@Injectable({
  providedIn: 'root'
})
export class NotificationInsuranceService {

  constructor(private readonly http: HttpClient) { }

  getAllReadNotifications(type: string = '', userFromId?: number): Observable<Notification[]> {
    const params: any = { type };
    if (userFromId) {
      params.userFromId = userFromId;
    }
    return this.http.get<Notification[]>(`${Enviroment.apiNotifications}/enterprise/read`, { params });
  }

  getAllUnreadNotifications(type: string = '', userFromId?: number): Observable<Notification[]> {
    const params: any = { type };
    if (userFromId) {
      params.userFromId = userFromId;
    }
    return this.http.get<Notification[]>(`${Enviroment.apiNotifications}/enterprise/unread`, { params });
  }

  putNotificationRead(id: NotificationRead): Observable<void> {
    return this.http.put<void>(`${Enviroment.apiNotifications}/enterprise/readNotification`, id);
  }
   getBrokers(): Observable<Broker[]> {
    return this.http.get<any[]>(`${Enviroment.apiBrokers}`).pipe(
      map(brokers =>
        brokers.map(b => ({
          id: b.id,
          username: b.username
        }))
      )
    );
  }
}
