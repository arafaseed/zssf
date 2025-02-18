import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeasePackageFormComponent } from './lease-package-form.component';

describe('LeasePackageFormComponent', () => {
  let component: LeasePackageFormComponent;
  let fixture: ComponentFixture<LeasePackageFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LeasePackageFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeasePackageFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
