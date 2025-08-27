import { TestBed } from '@angular/core/testing';

import { StaffVenueHandoverService } from './staff-venue-handover.service';

describe('StaffVenueHandoverService', () => {
  let service: StaffVenueHandoverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StaffVenueHandoverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
