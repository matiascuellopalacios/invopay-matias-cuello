/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ProvidersService } from './providers.service';

describe('Service: Providers', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProvidersService]
    });
  });

  it('should ...', inject([ProvidersService], (service: ProvidersService) => {
    expect(service).toBeTruthy();
  }));
});
