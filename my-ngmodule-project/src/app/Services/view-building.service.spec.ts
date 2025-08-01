import { TestBed } from '@angular/core/testing';

import { ViewBuildingService } from './view-building.service';

describe('ViewBuildingService', () => {
  let service: ViewBuildingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ViewBuildingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
