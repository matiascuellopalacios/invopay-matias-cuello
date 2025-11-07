import { TestBed } from '@angular/core/testing';

import { NotificationBrokerService } from './notification-broker.service';

describe('NotificationBrokerService', () => {
  let service: NotificationBrokerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationBrokerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
