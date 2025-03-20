import { TestBed } from '@angular/core/testing';

import { BuildinglistService } from './buildinglist.service';

describe('BuildinglistService', () => {
  let service: BuildinglistService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BuildinglistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
