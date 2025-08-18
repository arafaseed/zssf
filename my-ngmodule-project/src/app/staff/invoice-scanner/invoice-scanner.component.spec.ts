import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceScannerComponent } from './invoice-scanner.component';

describe('InvoiceScannerComponent', () => {
  let component: InvoiceScannerComponent;
  let fixture: ComponentFixture<InvoiceScannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InvoiceScannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceScannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
