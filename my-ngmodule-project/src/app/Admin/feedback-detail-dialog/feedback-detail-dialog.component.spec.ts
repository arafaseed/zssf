import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackDetailDialogComponent } from './feedback-detail-dialog.component';

describe('FeedbackDetailDialogComponent', () => {
  let component: FeedbackDetailDialogComponent;
  let fixture: ComponentFixture<FeedbackDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FeedbackDetailDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedbackDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
