import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Chart } from 'chart.js/auto';
import { DashboardService } from '../../Services/dashboard.service';

@Component({
  selector: 'app-admin-report',
  standalone:false,
  templateUrl: './admin-report.component.html',
  styleUrls: ['./admin-report.component.css']
})
export class AdminReportComponent implements AfterViewInit {

  reportType: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' = 'MONTHLY';
  selectedMonth: string = '';
  selectedQuarter: number = 1;
  selectedYear: number = new Date().getFullYear();
  reportData: any = null;

  @ViewChild('reportContent') reportContent!: ElementRef;

  constructor(private dashboardService: DashboardService) {}

  ngAfterViewInit() {}

  onReportTypeChange() {
    this.reportData = null;
  }

  async loadReport() {
    this.reportData = null;

    const year = this.selectedYear;
    const month = this.selectedMonth ? new Date(this.selectedMonth).getMonth() + 1 : null;
    const quarter = this.selectedQuarter;

    try {
      const [bookings, revenue, mostBooked, mostBookedComplete, bestRevenue] =
        await Promise.all([
          this.dashboardService.getAllBookings().toPromise(),
          this.dashboardService.getTotalRevenue().toPromise(),
          this.dashboardService.getMostBookedVenue().toPromise(),
          this.dashboardService.getMostBookedCompletedVenue().toPromise(),
          this.dashboardService.getBestRevenueVenue().toPromise()
        ]);

      const filteredBookings = bookings?.filter(b => {
        const bookingDate = new Date(b.date);
        if (this.reportType === 'MONTHLY') {
          return bookingDate.getFullYear() === year && bookingDate.getMonth() + 1 === month;
        } else if (this.reportType === 'QUARTERLY') {
          const startMonth = (quarter - 1) * 3;
          return bookingDate.getFullYear() === year && bookingDate.getMonth() >= startMonth && bookingDate.getMonth() < startMonth + 3;
        } else {
          return bookingDate.getFullYear() === year;
        }
      }) || [];

      const totalBookings = filteredBookings.length;
      const numCustomers = new Set(filteredBookings.map(b => b.customerId)).size;

      this.reportData = {
        startDate: filteredBookings.length ? filteredBookings[0].date : 'N/A',
        endDate: filteredBookings.length ? filteredBookings[filteredBookings.length - 1].date : 'N/A',
        platforms: [
          { name: 'Bookings', value: totalBookings },
          { name: 'Revenue', value: revenue || 0 }
        ],
        items: [
          {
            name: "Total Overall Bookings",
            week1: filteredBookings.filter(b => new Date(b.date).getDate() >= 1 && new Date(b.date).getDate() <= 7).length,
            week2: filteredBookings.filter(b => new Date(b.date).getDate() >= 8 && new Date(b.date).getDate() <= 14).length,
            week3: filteredBookings.filter(b => new Date(b.date).getDate() >= 15 && new Date(b.date).getDate() <= 21).length,
            week4: filteredBookings.filter(b => new Date(b.date).getDate() >= 22).length
          },
          {
            name: "Most Overall Booked Venue",
            week1: mostBooked?.venueName || 'N/A',
            week2: mostBooked?.venueName || 'N/A',
            week3: mostBooked?.venueName || 'N/A',
            week4: mostBooked?.venueName || 'N/A'
          },
          {
            name: "Best Revenue Venue",
            week1: bestRevenue?.venue?.venueName || 'N/A',
            week2: bestRevenue?.venue?.venueName || 'N/A',
            week3: bestRevenue?.venue?.venueName || 'N/A',
            week4: bestRevenue?.venue?.venueName || 'N/A'
          },
          {
            name: "Total Revenue",
            week1: revenue || 0,
            week2: revenue || 0,
            week3: revenue || 0,
            week4: revenue || 0
          },
          {
            name: "Top 'COMPLETE' Booked Venue",
            week1: mostBookedComplete?.venueName || 'N/A',
            week2: mostBookedComplete?.venueName || 'N/A',
            week3: mostBookedComplete?.venueName || 'N/A',
            week4: mostBookedComplete?.venueName || 'N/A'
          },
          {
            name: "Number of Customers",
            week1: numCustomers,
            week2: numCustomers,
            week3: numCustomers,
            week4: numCustomers
          }
        ]
      };

      setTimeout(() => this.createCharts(), 0);

    } catch (error) {
      console.error('Error loading report:', error);
    }
  }

  createCharts() {
    const pieCanvas = document.getElementById('pieChart') as HTMLCanvasElement;
    const barCanvas = document.getElementById('barChart') as HTMLCanvasElement;

    if (!pieCanvas || !barCanvas) return;

    const existingPie = Chart.getChart('pieChart');
    const existingBar = Chart.getChart('barChart');
    if (existingPie) existingPie.destroy();
    if (existingBar) existingBar.destroy();

    const pieLabels = this.reportData.platforms.map((p: any) => p.name);
    const pieValues = this.reportData.platforms.map((p: any) => p.value);

    new Chart(pieCanvas, {
      type: 'pie',
      data: {
        labels: pieLabels,
        datasets: [{
          data: pieValues,
          backgroundColor: ['#60A5FA', '#34D399', '#FBBF24', '#A78BFA']
        }]
      }
    });

    const barLabels = this.reportData.items.map((i: any) => i.name);
    const week1 = this.reportData.items.map((i: any) => i.week1);
    const week2 = this.reportData.items.map((i: any) => i.week2);
    const week3 = this.reportData.items.map((i: any) => i.week3);
    const week4 = this.reportData.items.map((i: any) => i.week4);

    new Chart(barCanvas, {
      type: 'bar',
      data: {
        labels: barLabels,
        datasets: [
          { label: 'Week 1', data: week1, backgroundColor: '#60A5FA' },
          { label: 'Week 2', data: week2, backgroundColor: '#34D399' },
          { label: 'Week 3', data: week3, backgroundColor: '#FBBF24' },
          { label: 'Week 4', data: week4, backgroundColor: '#A78BFA' }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top' } }
      }
    });
  }

  downloadReport() {
    html2canvas(this.reportContent.nativeElement).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`report-${this.reportType}-${this.selectedYear}.pdf`);
    });
  }

  printReport() {
    html2canvas(this.reportContent.nativeElement).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const printWindow = window.open('', '_blank', 'width=900,height=700');
      if (printWindow) {
        printWindow.document.write(`<html><head><title>Print Report</title></head><body style="text-align:center"><img src="${imgData}" style="width:100%"/></body></html>`);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      }
    });
  }

  getWeekHeaders(): string[] {
    return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  }
}
