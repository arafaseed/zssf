import { Component, ElementRef, ViewChild } from '@angular/core';
import { DashboardService } from '../../Services/dashboard.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-admin-report',
  standalone:false,
  templateUrl: './admin-report.component.html',
  styleUrls: ['./admin-report.component.css']
})
export class AdminReportComponent {

  reportType: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' = 'MONTHLY';
  selectedMonth: string = '';
  selectedQuarter: number = 1;
  selectedYear: number = new Date().getFullYear();

  reportData: any = null;

  @ViewChild('reportContent') reportContent!: ElementRef;

  constructor(private dashboardService: DashboardService) {}

  onReportTypeChange() {
    this.reportData = null; // reset data when type changes
  }

  loadReport() {
    const year = this.selectedYear;
    if (this.reportType === 'MONTHLY' && this.selectedMonth) {
      const [yStr, mStr] = this.selectedMonth.split('-');
      this.dashboardService.getMonthlyBookingStats(Number(yStr), Number(mStr)).subscribe(stats => {
        this.populateReport(stats);
      });
    } else if (this.reportType === 'YEARLY') {
      this.dashboardService.getYearlyBookingStats(year).subscribe(stats => {
        this.populateReport(stats);
      });
    } else if (this.reportType === 'QUARTERLY') {
      // quarterly aggregation: fetch 3 months stats per quarter
      const months = [(this.selectedQuarter-1)*3+1, (this.selectedQuarter-1)*3+2, (this.selectedQuarter-1)*3+3];
      let allStats: any[] = [];
      let completed = 0;
      months.forEach(m => {
        this.dashboardService.getMonthlyBookingStats(year, m).subscribe(stats => {
          allStats.push(...stats);
          completed++;
          if (completed === 3) {
            this.populateReport(allStats);
          }
        });
      });
    }
  }

  populateReport(stats: any[]) {
    const totalBookings = stats.reduce((a, s) => a + (s.count ?? 0), 0);
    const completedBookings = stats.filter(s => s.status==='COMPLETE').reduce((a,s)=>a+s.count,0);
    // for simplicity, using dashboardService.getMonthlyRevenue() or getYearlyRevenue() could be added
    this.reportData = {
      totalBookings,
      completedBookings,
      totalRevenue: 0, // optional: you can fetch revenue similarly
      mostBookedVenue: stats.length ? { venueName: stats[0]?.venueName || '–' } : null
    };
  }

  downloadReport() {
    const data = this.reportContent.nativeElement;
    html2canvas(data).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`report-${this.reportType}-${this.selectedYear}.pdf`);
    });
  }

  printReport() {
    const printContents = this.reportContent.nativeElement.innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  }
}


