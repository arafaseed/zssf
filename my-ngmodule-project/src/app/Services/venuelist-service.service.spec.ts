import { TestBed } from '@angular/core/testing';

import { VenuelistServiceService } from './venuelist-service.service';

describe('VenuelistServiceService', () => {
  let service: VenuelistServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VenuelistServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
