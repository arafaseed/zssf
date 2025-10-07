import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostponeDialogComponent } from './postpone-dialog.component';

describe('PostponeDialogComponent', () => {
  let component: PostponeDialogComponent;
  let fixture: ComponentFixture<PostponeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostponeDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostponeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
