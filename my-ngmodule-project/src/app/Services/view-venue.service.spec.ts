import { TestBed } from '@angular/core/testing';

import { ViewVenueService } from './view-venue.service';

describe('ViewVenueService', () => {
  let service: ViewVenueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ViewVenueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
