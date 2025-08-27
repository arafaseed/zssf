import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenueExplorerComponent } from './venue-explorer.component';

describe('VenueExplorerComponent', () => {
  let component: VenueExplorerComponent;
  let fixture: ComponentFixture<VenueExplorerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VenueExplorerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VenueExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
