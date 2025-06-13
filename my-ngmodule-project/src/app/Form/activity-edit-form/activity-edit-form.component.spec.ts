import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityEditFormComponent } from './activity-edit-form.component';

describe('ActivityEditFormComponent', () => {
  let component: ActivityEditFormComponent;
  let fixture: ComponentFixture<ActivityEditFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActivityEditFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivityEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
