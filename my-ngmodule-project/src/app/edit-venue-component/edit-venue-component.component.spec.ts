import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditVenueComponentComponent } from './edit-venue-component.component';

describe('EditVenueComponentComponent', () => {
  let component: EditVenueComponentComponent;
  let fixture: ComponentFixture<EditVenueComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditVenueComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditVenueComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
