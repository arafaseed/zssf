import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminbookingComponent } from './adminbooking.component';

describe('AdminbookingComponent', () => {
  let component: AdminbookingComponent;
  let fixture: ComponentFixture<AdminbookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminbookingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminbookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
