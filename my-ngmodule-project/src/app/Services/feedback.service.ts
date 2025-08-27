import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FeedbackDto } from '../models/models';


@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private base = '/api/feedback';

  constructor(private http: HttpClient) {}

  createFeedback(payload: Partial<FeedbackDto>): Observable<FeedbackDto> {
    return this.http.post<FeedbackDto>(`${this.base}/post`, payload);
  }

  listFeedbacks(showArchived = false): Observable<FeedbackDto[]> {
    const params = new HttpParams().set('archived', String(showArchived));
    return this.http.get<FeedbackDto[]>(`${this.base}/view-feedback`, { params });
  }

  getFeedback(id: number): Observable<FeedbackDto> {
    return this.http.get<FeedbackDto>(`${this.base}/view-byId/${id}`);
  }

  toggleArchive(id: number, archive: boolean): Observable<void> {
    return this.http.put<void>(`${this.base}/archive/${id}`, { archived: archive });
  }

  deleteFeedback(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/delete/${id}`);
  }
}
