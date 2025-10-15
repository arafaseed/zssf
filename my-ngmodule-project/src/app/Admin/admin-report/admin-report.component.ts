import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Chart } from 'chart.js/auto';
import { DashboardService } from '../../Services/dashboard.service';
import { lastValueFrom } from 'rxjs';

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

  dateGenerated = new Date().toLocaleString();
  reportPeriod = '';

  stats = {
    totalBookings: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    mostBookedVenue: '',
    bestRevenueVenue: '',
    completedBookings: 0,
    topCustomer: { name: '', bookings: 0 }
  };

  topRevenueVenues: { venueName: string, revenue: number }[] = [];

  @ViewChild('reportContent') reportContent!: ElementRef;

  private topBarChart?: Chart;

  constructor(private dashboardService: DashboardService) {}

  ngAfterViewInit() {
    // nothing required immediately; user will generate report
  }

  onReportTypeChange() {
    this.reportData = null;
    this.dateGenerated = new Date().toLocaleString();
  }

  async loadReport() {
    // reset
    this.reportData = null;
    this.topRevenueVenues = [];
    this.stats = {
      totalBookings: 0,
      totalCustomers: 0,
      totalRevenue: 0,
      mostBookedVenue: '',
      bestRevenueVenue: '',
      completedBookings: 0,
      topCustomer: { name: '', bookings: 0 }
    };

    // compute date range string for the period label
    this.reportPeriod = this.computeReportPeriod();

    try {
      // fetch parallel
      const bookings = await lastValueFrom(this.dashboardService.getAllBookings());
      const totalRevenue = await lastValueFrom(this.dashboardService.getTotalRevenue());
      const mostBooked = await lastValueFrom(this.dashboardService.getMostBookedVenue());
      const mostBookedComplete = await lastValueFrom(this.dashboardService.getMostBookedCompletedVenue());
      const bestRevenue = await lastValueFrom(this.dashboardService.getBestRevenueVenue());
      const topVenues = await lastValueFrom(this.dashboardService.getTopVenuesByRevenue());

      // filter bookings by requested period
      const filtered = (bookings || []).filter((b: any) => this.bookingMatchesPeriod(b));
      // sort by date so we can set start/end
      filtered.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const uniqueCustomers = new Set((filtered || []).map((b: any) => b.customerId ?? b.customer?.customerId ?? b.customer?.phoneNumber));
      const completedCount = (filtered || []).filter((b: any) => (b.bookingStatus || b.status) === 'COMPLETE').length;

      // top customer calculation (by booking count) from filtered bookings
      const customerCountMap = new Map<string, number>();
      (filtered || []).forEach((b: any) => {
        const key = b.customer?.customerName || b.customerId || b.customer?.phoneNumber || 'Unknown';
        customerCountMap.set(key, (customerCountMap.get(key) || 0) + 1);
      });
      let topCustomerName = '';
      let topCustomerBookings = 0;
      for (const [k, v] of customerCountMap.entries()) {
        if (v > topCustomerBookings) {
          topCustomerBookings = v;
          topCustomerName = k;
        }
      }

      // prepare reportData (keeps your old structure for weekly table display)
      const totalBookings = filtered.length;
      const numCustomers = uniqueCustomers.size;

      // if no filtered booking dates, show N/A
      const startDate = filtered.length ? filtered[0].date : 'N/A';
      const endDate = filtered.length ? filtered[filtered.length - 1].date : 'N/A';

      // create weekly breakdown items (same as previous logic)
      const items = [
        {
          name: "Total Overall Bookings",
          week1: filtered.filter((b: any) => new Date(b.date).getDate() >= 1 && new Date(b.date).getDate() <= 7).length,
          week2: filtered.filter((b: any) => new Date(b.date).getDate() >= 8 && new Date(b.date).getDate() <= 14).length,
          week3: filtered.filter((b: any) => new Date(b.date).getDate() >= 15 && new Date(b.date).getDate() <= 21).length,
          week4: filtered.filter((b: any) => new Date(b.date).getDate() >= 22).length
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
          week1: totalRevenue || 0,
          week2: totalRevenue || 0,
          week3: totalRevenue || 0,
          week4: totalRevenue || 0
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
      ];

      // assign topRevenueVenues simplified
      this.topRevenueVenues = (topVenues || []).map((t: any) => ({
        venueName: t.venue?.venueName || t.venueName || 'Unknown',
        revenue: t.revenue ?? 0
      })).sort((a: any,b:any) => b.revenue - a.revenue).slice(0, 5);

      // populate stats used in template
      this.stats.totalBookings = totalBookings;
      this.stats.totalCustomers = numCustomers;
      this.stats.totalRevenue = totalRevenue || 0;
      this.stats.mostBookedVenue = mostBooked?.venueName || '–';
      this.stats.bestRevenueVenue = bestRevenue?.venue?.venueName || '–';
      this.stats.completedBookings = completedCount;
      this.stats.topCustomer = { name: topCustomerName || '–', bookings: topCustomerBookings || 0 };

      this.reportData = { startDate, endDate, platforms: [{name:'Bookings',value: totalBookings},{name:'Revenue',value: totalRevenue || 0}], items };

      // create the bar chart (top)
      setTimeout(() => this.createTopBarChart(), 50);

    } catch (err) {
      console.error('Failed to load report data', err);
    }
  }

  private computeReportPeriod(): string {
    if (this.reportType === 'MONTHLY' && this.selectedMonth) {
      const d = new Date(this.selectedMonth);
      return d.toLocaleString(undefined, { month: 'long', year: 'numeric' });
    } else if (this.reportType === 'QUARTERLY') {
      const q = this.selectedQuarter;
      return `Q${q} ${this.selectedYear}`;
    } else {
      return `${this.selectedYear}`;
    }
  }

  private bookingMatchesPeriod(b: any): boolean {
    if (!b || !b.date) return false;
    const d = new Date(b.date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    if (this.reportType === 'MONTHLY') {
      if (!this.selectedMonth) return true;
      const sel = new Date(this.selectedMonth);
      return year === sel.getFullYear() && month === sel.getMonth() + 1;
    } else if (this.reportType === 'QUARTERLY') {
      const startMonth = (this.selectedQuarter - 1) * 3 + 1;
      return year === this.selectedYear && month >= startMonth && month < startMonth + 3;
    } else {
      return year === this.selectedYear;
    }
  }

  private createTopBarChart() {
    const canvas = document.getElementById('topBarChart') as HTMLCanvasElement;
    if (!canvas) return;

    // destroy existing
    const existing = Chart.getChart(canvas as any);
    if (existing) existing.destroy();

    // Prefer revenue per venue if available; else show number of bookings per venue (fallback)
    let labels: string[] = [];
    let dataValues: number[] = [];
    if (this.topRevenueVenues && this.topRevenueVenues.length) {
      labels = this.topRevenueVenues.map(v => v.venueName);
      dataValues = this.topRevenueVenues.map(v => v.revenue);
    } else if (this.reportData && this.reportData.items) {
      // fallback: use first item's weekly numbers aggregated by name (not ideal but fallback)
      labels = this.reportData.items.map((i: any) => i.name);
      dataValues = this.reportData.items.map((i: any) => Number(i.week1 || 0) + Number(i.week2 || 0) + Number(i.week3 || 0) + Number(i.week4 || 0));
    }

    this.topBarChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Revenue (TZS)',
          data: dataValues,
          backgroundColor: '#3b82f6'
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: { ticks: { autoSkip: false } },
          y: { beginAtZero: true }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  downloadReport() {
    if (!this.reportContent) return;
    html2canvas(this.reportContent.nativeElement, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`venue-report-${this.reportType}-${this.selectedYear}.pdf`);
    }).catch(err => console.error('PDF export failed', err));
  }

  printReport() {
    if (!this.reportContent) { window.print(); return; }
    // We keep printing simple: open a new window with the image to preserve styles
    html2canvas(this.reportContent.nativeElement, { scale: 2 }).then(canvas => {
      const img = canvas.toDataURL('image/png');
      const w = window.open('', '_blank', 'width=900,height=700');
      if (!w) { window.print(); return; }
      w.document.write(`
        <html>
          <head>
            <title>Print Report</title>
            <style>
              body { margin: 0; padding: 12px; font-family: Arial, sans-serif; background: #fff; }
              img { width: 100%; height: auto; display:block; }
            </style>
          </head>
          <body>
            <img src="${img}" />
          </body>
        </html>
      `);
      w.document.close();
      w.focus();
      w.print();
    }).catch(err => {
      console.error('Print failed, falling back to window.print', err);
      window.print();
    });
  }
}
