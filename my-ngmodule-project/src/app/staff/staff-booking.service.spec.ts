import { TestBed } from '@angular/core/testing';

import { StaffBookingService } from './staff-booking.service';

describe('StaffBookingService', () => {
  let service: StaffBookingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StaffBookingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
