import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MajengoComponent } from './majengo.component';

describe('MajengoComponent', () => {
  let component: MajengoComponent;
  let fixture: ComponentFixture<MajengoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MajengoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MajengoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
