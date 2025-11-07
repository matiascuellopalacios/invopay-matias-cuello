/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SellService } from './sell.service';

describe('Service: Sell', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SellService]
    });
  });

  it('should ...', inject([SellService], (service: SellService) => {
    expect(service).toBeTruthy();
  }));
});
