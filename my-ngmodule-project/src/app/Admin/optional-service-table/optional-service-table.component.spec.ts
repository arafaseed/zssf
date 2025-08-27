import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionalServiceTableComponent } from './optional-service-table.component';

describe('OptionalServiceTableComponent', () => {
  let component: OptionalServiceTableComponent;
  let fixture: ComponentFixture<OptionalServiceTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OptionalServiceTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OptionalServiceTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
