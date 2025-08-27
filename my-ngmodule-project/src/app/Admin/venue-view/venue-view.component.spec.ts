import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenueViewComponent } from './venue-view.component';

describe('VenueViewComponent', () => {
  let component: VenueViewComponent;
  let fixture: ComponentFixture<VenueViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VenueViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VenueViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
