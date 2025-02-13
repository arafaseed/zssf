import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeasePackageTableComponent } from './lease-package-table.component';

describe('LeasePackageTableComponent', () => {
  let component: LeasePackageTableComponent;
  let fixture: ComponentFixture<LeasePackageTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LeasePackageTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeasePackageTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
