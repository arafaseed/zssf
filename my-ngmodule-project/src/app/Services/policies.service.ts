// src/app/admin/services/admin-policies.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ExpiryViewResp {
  expiryHours: number;
}

export interface DiscountPolicy {
  id: number;
  year: number;
  discountRate: number;    // decimal e.g. 0.25
  maxUsesPerYear: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class PoliciesService {
  private base = '';

  constructor(private http: HttpClient) {}

  // Booking expiry
  viewCurrentExpiry(): Observable<ExpiryViewResp> {
    return this.http.get<ExpiryViewResp>(`${this.base}/api/booking-expiry/view-current-time`);
  }

  // update: accepts { hours } or { days } as JSON per your backend contract
  updateExpiryByHours(hours: number) {
    return this.http.put(`${this.base}/api/booking-expiry/update-expiry-time`, { hours });
  }
  updateExpiryByDays(days: number) {
    return this.http.put(`${this.base}/api/booking-expiry/update-expiry-time`, { days });
  }

  // Discount policy
  viewCurrentDiscountPolicy(): Observable<DiscountPolicy> {
    return this.http.get<DiscountPolicy>(`${this.base}/api/discount-policy/view/current`);
  }

  // Update discount policy. Your backend expects form data (discountRate & maxUsesPerYear).
  // We'll send as application/x-www-form-urlencoded to match @RequestParam style endpoints.
  updateDiscountPolicy(discountRate: number, maxUsesPerYear: number) {
    const body = new HttpParams()
      .set('discountRate', String(discountRate))
      .set('maxUsesPerYear', String(maxUsesPerYear));

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    // PUT with urlencoded body
    return this.http.put(`${this.base}/api/discount-policy/update/current`, body.toString(), { headers, responseType: 'json' });
  }

  // Manual refresh (POST)
  manualRefreshPolicy() {
    return this.http.post(`${this.base}/api/discount-policy/manual-refresh/year`, {});
  }
}
