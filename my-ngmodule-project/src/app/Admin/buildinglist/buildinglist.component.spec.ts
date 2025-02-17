import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildinglistComponent } from './buildinglist.component';

describe('BuildinglistComponent', () => {
  let component: BuildinglistComponent;
  let fixture: ComponentFixture<BuildinglistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BuildinglistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuildinglistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
