import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardSwitchComponent } from './dashboard-switch.component';

describe('DashboardSwitchComponent', () => {
  let component: DashboardSwitchComponent;
  let fixture: ComponentFixture<DashboardSwitchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardSwitchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
