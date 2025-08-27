import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VenueStateService {
  private venueChangeSource = new BehaviorSubject<void>(undefined);
  venueChanged$ = this.venueChangeSource.asObservable();

  notifyVenueChange(): void {
    this.venueChangeSource.next();  // triggers subscribers
  }
}
