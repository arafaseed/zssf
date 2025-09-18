import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfViewerOverlayComponent } from './pdf-viewer-overlay.component';

describe('PdfViewerOverlayComponent', () => {
  let component: PdfViewerOverlayComponent;
  let fixture: ComponentFixture<PdfViewerOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PdfViewerOverlayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PdfViewerOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
