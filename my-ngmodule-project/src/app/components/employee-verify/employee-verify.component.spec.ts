import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeVerifyComponent } from './employee-verify.component';

describe('EmployeeVerifyComponent', () => {
  let component: EmployeeVerifyComponent;
  let fixture: ComponentFixture<EmployeeVerifyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeeVerifyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeVerifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
