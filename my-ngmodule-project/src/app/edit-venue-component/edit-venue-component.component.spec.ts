import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditVenueComponent} from './edit-venue-component.component';

describe('EditVenueComponentComponent', () => {
  let component: EditVenueComponent;
  let fixture: ComponentFixture<EditVenueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditVenueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditVenueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
