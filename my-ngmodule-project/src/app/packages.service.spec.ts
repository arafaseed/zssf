import { TestBed } from '@angular/core/testing';

import { LeasePackageService } from './packages.service';

describe('PackagesService', () => {
  let service: LeasePackageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LeasePackageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
