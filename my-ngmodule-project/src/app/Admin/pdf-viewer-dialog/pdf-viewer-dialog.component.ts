import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface PdfDialogData {
  bookingId: number;
  bookingCode?: string;
  docs: string[]; 
}

@Component({
  selector: 'app-pdf-viewer-dialog',
  standalone: false,
  templateUrl: './pdf-viewer-dialog.component.html',
  styleUrls: ['./pdf-viewer-dialog.component.css']
})
export class PdfViewerDialogComponent implements OnInit {
  docs: string[] = [];
  selectedUrl?: SafeResourceUrl;
  selectedIndex = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PdfDialogData,
    private dialogRef: MatDialogRef<PdfViewerDialogComponent>,
    private sanitizer: DomSanitizer
  ) {
    this.docs = data?.docs ?? [];
  }

  ngOnInit(): void {
    if (this.docs.length > 0) {
      this.selectDoc(0);
    }
  }

  selectDoc(idx: number) {
    if (!this.docs[idx]) {
      this.selectedUrl = undefined;
      return;
    }
    this.selectedIndex = idx;
    // sanitize and set embed URL
    // Many PDF hosting endpoints allow direct embedding; if not, you might need a proxy or use Google Docs viewer
    this.selectedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.docs[idx]);
  }

  close() {
    this.dialogRef.close();
  }
}
