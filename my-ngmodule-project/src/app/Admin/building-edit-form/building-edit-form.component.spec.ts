import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildingEditFormComponent } from './building-edit-form.component';

describe('BuildingEditFormComponent', () => {
  let component: BuildingEditFormComponent;
  let fixture: ComponentFixture<BuildingEditFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BuildingEditFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuildingEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
