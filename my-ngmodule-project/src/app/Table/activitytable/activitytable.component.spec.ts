import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityTableComponent } from './activitytable.component';

describe('ActivitytableComponent', () => {
  let component: ActivityTableComponent;
  let fixture: ComponentFixture<ActivityTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActivityTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivityTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
