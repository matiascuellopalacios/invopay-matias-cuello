import { TestBed } from '@angular/core/testing';

import { NotificationInsuranceService } from './notification-insurance.service';

describe('NotificationInsuranceService', () => {
  let service: NotificationInsuranceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationInsuranceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
