import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Notification, NotificationRead } from '../../../shared/models/notificationResponse';
import { Enviroment } from '../../../enviroment/Enviroment';
import { Broker } from '../models/broker';

@Injectable({
  providedIn: 'root'
})
export class NotificationBrokerService {

  constructor() { }
  private readonly http=inject(HttpClient);

  getAllReadNotifications():Observable<Notification[]>{
    return this.http.get<Notification[]>(`${Enviroment.apiNotifications}/provider/read`);
  }
  getAllUnreadNotifications():Observable<Notification[]>{
    return this.http.get<Notification[]>(`${Enviroment.apiNotifications}/provider/unread`);
  }
  putNotificationRead(id:NotificationRead):Observable<void>{
    return this.http.put<void>(`${Enviroment.apiNotifications}/provider/readNotification`,id);
  }
  
}
