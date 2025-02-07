import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';

// Dialog Component
@Component({
  selector: 'app-details-dialog',
  imports:[ MatDialogModule, // ✅ Import Dialog Module
      MatButtonModule, CommonModule],
  template: `
     <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.description }}</p>
      <div id="carouselDialog{{ data.title }}" class="carousel slide" data-bs-ride="carousel">
        <div class="carousel-inner">
          <div class="carousel-item" *ngFor="let img of data.images; let i = index" [ngClass]="{'active': i === 0}">
            <img [src]="img" class="d-block w-100" alt="Venue Image" />
          </div>
        </div>
        <button class="carousel-control-prev" type="button" [attr.data-bs-target]="'#carouselDialog' + data.title" data-bs-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        </button>
        <button class="carousel-control-next" type="button" [attr.data-bs-target]="'#carouselDialog' + data.title" data-bs-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
        </button>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="close()">Close</button>
    </mat-dialog-actions>
  `,
})
export class DetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any // ✅ FIXED: Inject data properly
  ) {}

  close() {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-venue',
  templateUrl: './venue.component.html',
  standalone: false,
  styleUrls: ['./venue.component.css'],
})
export class VenueComponent {
  venues = [
    {
      title: 'Creative Conference Room 1',
      description: 'Located on the second floor with a seating capacity of 50.',
      image: ['zssf.png','latylogo.png','zssf.png'],
    },
    {
      title: 'Creative Conference Room 2',
      description: 'A spacious hall with modern audio-visual equipment.',
      image: ['zssf.png','latylogo.png','zssf.png'],
    },
    {
      title: 'Creative Conference Room 3',
      description: 'Ideal for meetings and small conferences.',
      image: ['zssf.png','latylogo.png','zssf.png'],
    },
  ];

  constructor(public dialog: MatDialog, private router: Router) {}

  openDetails(venue: any) {
    this.dialog.open(DetailsDialogComponent, {
      data: venue, // ✅ Passing data correctly
      width: '400px',
    });
  }

  makeReservation() {
    this.router.navigate(['/reservation']);
  }
}
