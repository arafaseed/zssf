import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffTable } from './staff-table.component';

describe('StaffTable', () => {
  let component: StaffTable;
  let fixture: ComponentFixture<StaffTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StaffTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
