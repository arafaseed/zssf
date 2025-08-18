import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionalServiceEditFormComponent } from './optional-service-edit-form.component';

describe('OptionalServiceEditFormComponent', () => {
  let component: OptionalServiceEditFormComponent;
  let fixture: ComponentFixture<OptionalServiceEditFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OptionalServiceEditFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OptionalServiceEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
