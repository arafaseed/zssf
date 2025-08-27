import { Component, OnInit } from '@angular/core';
import { FeedbackService } from '../../Services/feedback.service';
import { FeedbackDto } from '../../models/models';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FeedbackDetailDialogComponent } from '../feedback-detail-dialog/feedback-detail-dialog.component';


@Component({
  selector: 'app-admin-feedbacks',
  standalone: false,
  templateUrl: './admin-feedbacks.component.html',
  styleUrls: ['./admin-feedbacks.component.css']
})
export class AdminFeedbacksComponent implements OnInit {
  feedbacks: FeedbackDto[] = [];
  loading = false;
  showArchived = false;

  constructor(
    private svc: FeedbackService, 
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.reload();
  }

  reload() {
    this.loading = true;
    this.svc.listFeedbacks(this.showArchived).subscribe({
      next: (list) => { this.feedbacks = list; this.loading = false; },
      error: (err) => { console.error(err); this.loading = false; }
    });
  }

  toggleArchived(feedback: FeedbackDto) {
    const newState = !feedback.archived;
    this.svc.toggleArchive(feedback.id!, newState).subscribe({
      next: () => this.reload(),
      error: (err) => console.error(err)
    });
  }

  view(feedback: FeedbackDto) {
  this.dialog.open(FeedbackDetailDialogComponent, {
    data: feedback,
    width: '520px',
    maxHeight: '80vh',
    panelClass: 'feedback-detail-dialog'
  });
}

}
