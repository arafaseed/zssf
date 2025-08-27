// src/app/admin/pages/admin-policies.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PoliciesService, DiscountPolicy, ExpiryViewResp } from '../../Services/policies.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-admin-policies',
  standalone: false,
  templateUrl: './policies-settings.component.html',
  // tailwind; leave css empty or add minor styles
})
export class PoliciesSettingsComponent implements OnInit {
  // expiry
  expiryHours = 24;                // canonical value (hours)
  expiryLoading = false;
  expiryError = '';
  // whether UI shows days or hours
  showAsDays = false;

  // discount
  discountPolicy: DiscountPolicy | null = null;
  discountLoading = false;
  discountError = '';
  refreshMessage = '';

  // forms
  expiryForm: FormGroup;
  discountForm: FormGroup;

  savingExpiry = false;
  savingDiscount = false;

  constructor(
    private fb: FormBuilder,
    private svc: PoliciesService
  ) {
    this.expiryForm = this.fb.group({
      hours: [null, [Validators.required, Validators.min(1)]],
      days: [null, [Validators.min(1)]]
    });

    this.discountForm = this.fb.group({
      discountRate: [null, [Validators.required, Validators.min(0), Validators.max(1)]],
      maxUsesPerYear: [null, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadExpiry();
    this.loadDiscountPolicy();
  }

  // --- expiry ---
  loadExpiry() {
    this.expiryLoading = true;
    this.expiryError = '';
    this.svc.viewCurrentExpiry()
      .pipe(finalize(() => this.expiryLoading = false))
      .subscribe({
        next: (r: ExpiryViewResp) => {
          this.expiryHours = r.expiryHours ?? 24;
          this.patchExpiryFormFromHours(this.expiryHours);
        },
        error: (err) => {
          this.expiryError = this.extractError(err, 'Failed to load expiry time');
        }
      });
  }

  patchExpiryFormFromHours(hours: number) {
    this.expiryForm.patchValue({
      hours,
      days: hours % 24 === 0 ? hours / 24 : null
    }, { emitEvent: false });
  }

  // User saves expiry - prefer hours if provided; else days
  saveExpiry() {
    this.expiryError = '';
    if (this.expiryForm.invalid) {
      this.expiryError = 'Invalid expiry values';
      return;
    }

    const hoursVal = this.expiryForm.value.hours;
    const daysVal = this.expiryForm.value.days;
    this.savingExpiry = true;
    const obs = (hoursVal && hoursVal > 0)
      ? this.svc.updateExpiryByHours(Number(hoursVal))
      : this.svc.updateExpiryByDays(Number(daysVal));

    obs.pipe(finalize(() => this.savingExpiry = false)).subscribe({
      next: (resp: any) => {
        // after update, reload canonical hours from server
        this.loadExpiry();
      },
      error: (err) => {
        this.expiryError = this.extractError(err, 'Failed to update expiry');
      }
    });
  }

  // toggle UI representation without changing underlying canonical value
  toggleShowAsDays() {
    this.showAsDays = !this.showAsDays;
  }

  // --- discount ---
  loadDiscountPolicy() {
    this.discountLoading = true;
    this.discountError = '';
    this.svc.viewCurrentDiscountPolicy()
      .pipe(finalize(() => this.discountLoading = false))
      .subscribe({
        next: (p: DiscountPolicy) => {
          this.discountPolicy = p;
          this.discountForm.patchValue({
            discountRate: p.discountRate,
            maxUsesPerYear: p.maxUsesPerYear
          }, { emitEvent: false });
        },
        error: (err) => {
          this.discountError = this.extractError(err, 'Failed to load discount policy');
        }
      });
  }

  saveDiscountPolicy() {
    if (this.discountForm.invalid) {
      this.discountError = 'Invalid discount values';
      return;
    }
    this.savingDiscount = true;
    const v = this.discountForm.value;
    this.svc.updateDiscountPolicy(Number(v.discountRate), Number(v.maxUsesPerYear))
      .pipe(finalize(() => this.savingDiscount = false))
      .subscribe({
        next: () => {
          this.loadDiscountPolicy();
        },
        error: (err) => {
          this.discountError = this.extractError(err, 'Failed to update discount policy');
        }
      });
  }

  manualRefresh() {
    this.refreshMessage = '';
    this.svc.manualRefreshPolicy().subscribe({
      next: (r: any) => {
        // backend returns string message per your earlier note
        this.refreshMessage = typeof r === 'string' ? r : JSON.stringify(r);
        this.loadDiscountPolicy();
      },
      error: (err) => {
        this.refreshMessage = this.extractError(err, 'Manual refresh failed');
      }
    });
  }

  // small helper
  private extractError(err: any, fallback: string) {
    if (!err) return fallback;
    if (err.error && typeof err.error === 'string') return err.error;
    if (err.error && err.error.message) return err.error.message;
    if (err.message) return err.message;
    return fallback;
  }
}
