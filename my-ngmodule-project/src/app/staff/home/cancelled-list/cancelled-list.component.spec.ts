import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelledListComponent } from './cancelled-list.component';

describe('CancelledListComponent', () => {
  let component: CancelledListComponent;
  let fixture: ComponentFixture<CancelledListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CancelledListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CancelledListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
