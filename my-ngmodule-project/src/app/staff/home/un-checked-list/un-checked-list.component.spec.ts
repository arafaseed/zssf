import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnCheckedListComponent } from './un-checked-list.component';

describe('UnCheckedListComponent', () => {
  let component: UnCheckedListComponent;
  let fixture: ComponentFixture<UnCheckedListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UnCheckedListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnCheckedListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
