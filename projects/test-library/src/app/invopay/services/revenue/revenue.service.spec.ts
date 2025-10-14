/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { RevenueService } from './revenue.service';

describe('Service: Revenue', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RevenueService]
    });
  });

  it('should ...', inject([RevenueService], (service: RevenueService) => {
    expect(service).toBeTruthy();
  }));
});
