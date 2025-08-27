import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { OptionalServiceService } from './optional.service';

describe('OptionalServiceService', () => {
  let service: OptionalServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // needed since your service uses HttpClient
      providers: [OptionalServiceService]
    });
    service = TestBed.inject(OptionalServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
