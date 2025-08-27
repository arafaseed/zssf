import { TestBed } from '@angular/core/testing';

import { StaffViewService } from './staff-view.service';

describe('StaffViewService', () => {
  let service: StaffViewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StaffViewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
