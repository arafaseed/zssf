import { TestBed } from '@angular/core/testing';

import { VenueServiceService } from './venue-service.service';

describe('VenueServiceService', () => {
  let service: VenueServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VenueServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
