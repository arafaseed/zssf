import { TestBed } from '@angular/core/testing';

import { EmployeeVerifyService } from './employee-verify.service';

describe('EmployeeVerifyService', () => {
  let service: EmployeeVerifyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmployeeVerifyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
