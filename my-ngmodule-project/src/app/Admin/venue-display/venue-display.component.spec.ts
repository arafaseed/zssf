import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenueDisplayComponent } from './venue-display.component';

describe('VenueDisplayComponent', () => {
  let component: VenueDisplayComponent;
  let fixture: ComponentFixture<VenueDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VenueDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VenueDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
