import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoliciesSettingsComponent } from './policies-settings.component';

describe('PoliciesSettingsComponent', () => {
  let component: PoliciesSettingsComponent;
  let fixture: ComponentFixture<PoliciesSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PoliciesSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoliciesSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
