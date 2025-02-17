import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeasePackageEditFormComponent } from './lease-package-edit-form.component';

describe('LeasePackageEditFormComponent', () => {
  let component: LeasePackageEditFormComponent;
  let fixture: ComponentFixture<LeasePackageEditFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LeasePackageEditFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeasePackageEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
