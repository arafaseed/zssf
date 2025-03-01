import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionalBookingDialogComponent } from './additional-booking-dialog.component';

describe('AdditionalBookingDialogComponent', () => {
  let component: AdditionalBookingDialogComponent;
  let fixture: ComponentFixture<AdditionalBookingDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdditionalBookingDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdditionalBookingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
