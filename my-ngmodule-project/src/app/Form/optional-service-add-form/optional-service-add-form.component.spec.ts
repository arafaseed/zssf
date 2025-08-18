import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionalServiceAddFormComponent } from './optional-service-add-form.component';

describe('OptionalServiceAddFormComponent', () => {
  let component: OptionalServiceAddFormComponent;
  let fixture: ComponentFixture<OptionalServiceAddFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OptionalServiceAddFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OptionalServiceAddFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
