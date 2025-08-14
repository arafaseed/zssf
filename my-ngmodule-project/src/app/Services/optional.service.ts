import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OptionalService } from '../models/models';
import { Observable, of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class OptionalServiceService {

  private base = 'http://localhost:8080/api/optional-services';

  private cache = new Map<number, Observable<OptionalService | null>>();
  constructor(private http: HttpClient){}

  getServiceById(id: number) {
    if (this.cache.has(id)) return this.cache.get(id)!;
    const obs = this.http.get<OptionalService>(`${this.base}/serviceBy/${id}`)
      .pipe(catchError(() => of(null)), shareReplay(1));
    this.cache.set(id, obs);
    return obs;
  }
}
