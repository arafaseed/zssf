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

  // ----------------- helpers to normalize booking shape -----------------
  private getBookingDateObj(b: any): Date | null {
    const raw = b?.date || b?.bookingDate || b?.startDate || b?.booking_date;
    if (!raw) return null;
    const d = new Date(raw);
    if (isNaN(d.getTime())) return null;
    return d;
  }

  private getBookingDateString(b: any): string {
    const d = this.getBookingDateObj(b);
    return d ? d.toISOString() : 'N/A';
  }

  private getBookingRevenue(b: any): number {
    // try common fields used for amount
    const candidates = [b?.totalAmount, b?.amount, b?.price, b?.revenue, b?.bookingAmount];
    for (const c of candidates) {
      if (typeof c === 'number' && !isNaN(c)) return c;
      if (typeof c === 'string' && !isNaN(Number(c))) return Number(c);
    }
    // fallback: maybe there's a nested venue.price or similar
    if (b?.venue?.price) {
      const p = b.venue.price;
      if (typeof p === 'number') return p;
      if (typeof p === 'string' && !isNaN(Number(p))) return Number(p);
    }
    return 0;
  }
  // ----------------------------------------------------------------------

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
      // fetch totals / top lists (we'll still use them as "overall" references)
      const totalRevenueOverall = await lastValueFrom(this.dashboardService.getTotalRevenue());
      const mostBooked = await lastValueFrom(this.dashboardService.getMostBookedVenue());
      const mostBookedComplete = await lastValueFrom(this.dashboardService.getMostBookedCompletedVenue());
      const bestRevenue = await lastValueFrom(this.dashboardService.getBestRevenueVenue());
      const topVenues = await lastValueFrom(this.dashboardService.getTopVenuesByRevenue());

      // normalize/filter bookings by requested period using bookingDate/startDate/bookingDate etc.
      const filtered = (bookings || []).filter((b: any) => this.bookingMatchesPeriod(b));

      // sort by date so we can set start/end
      filtered.sort((a: any, b: any) => {
        const da = this.getBookingDateObj(a)?.getTime() ?? 0;
        const db = this.getBookingDateObj(b)?.getTime() ?? 0;
        return da - db;
      });

      // unique customers — use phoneNumber as unique identifier where possible
      const uniqueCustomers = new Set(
        (filtered || []).map((b: any) => {
          return b?.customer?.phoneNumber?.trim() || b?.customerId || b?.customer?.customerName || 'Unknown';
        }).filter((x: any) => !!x)
      );

      const completedCount = (filtered || []).filter((b: any) => (b.bookingStatus || b.status) === 'COMPLETE').length;

      // top customer calculation (by booking count) from filtered bookings — prefer phone number
      const customerCountMap = new Map<string, number>();
      (filtered || []).forEach((b: any) => {
        const key = b?.customer?.phoneNumber || b?.customer?.customerName || b?.customerId || 'Unknown';
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

      // compute filtered revenue by summing booking-level revenue (best-effort)
      const filteredRevenue = filtered.reduce((acc: number, b: any) => acc + this.getBookingRevenue(b), 0);

      // if no filtered booking dates, show N/A
      const startDate = filtered.length ? this.getBookingDateString(filtered[0]) : 'N/A';
      const endDate = filtered.length ? this.getBookingDateString(filtered[filtered.length - 1]) : 'N/A';

      // compute most booked venue from filtered bookings (fallback to service-mostBooked if filtered empty)
      const computeMostBookedFromFiltered = () => {
        const map = new Map<string, number>();
        filtered.forEach((b: any) => {
          const vname = b?.venue?.venueName || b?.venueName || 'Unknown';
          map.set(vname, (map.get(vname) || 0) + 1);
        });
        let best = '', bestCount = 0;
        for (const [k, v] of map.entries()) {
          if (v > bestCount) { bestCount = v; best = k; }
        }
        return best || (mostBooked?.venueName || 'N/A');
      };

      const mostBookedFilteredName = filtered.length ? computeMostBookedFromFiltered() : (mostBooked?.venueName || 'N/A');

      // create weekly breakdown items (same as previous logic but using normalized date)
      const weekCount = (predicate: (d: Date) => boolean) =>
        filtered.filter((b: any) => {
          const d = this.getBookingDateObj(b);
          return d ? predicate(d) : false;
        }).length;

      const items = [
        {
          name: "Total Overall Bookings",
          week1: weekCount(d => d.getDate() >= 1 && d.getDate() <= 7),
          week2: weekCount(d => d.getDate() >= 8 && d.getDate() <= 14),
          week3: weekCount(d => d.getDate() >= 15 && d.getDate() <= 21),
          week4: weekCount(d => d.getDate() >= 22)
        },
        {
          name: "Most Overall Booked Venue",
          week1: mostBookedFilteredName,
          week2: mostBookedFilteredName,
          week3: mostBookedFilteredName,
          week4: mostBookedFilteredName
        },
        {
          name: "Best Revenue Venue",
          week1: bestRevenue?.venue?.venueName || 'N/A',
          week2: bestRevenue?.venue?.venueName || 'N/A',
          week3: bestRevenue?.venue?.venueName || 'N/A',
          week4: bestRevenue?.venue?.venueName || 'N/A'
        },
        {
          name: "Total Revenue (period)",
          week1: filteredRevenue,
          week2: filteredRevenue,
          week3: filteredRevenue,
          week4: filteredRevenue
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

      // assign topRevenueVenues simplified (these are overall top venues from service)
      this.topRevenueVenues = (topVenues || []).map((t: any) => ({
        venueName: t.venue?.venueName || t.venueName || 'Unknown',
        revenue: t.revenue ?? 0
      })).sort((a: any,b:any) => b.revenue - a.revenue).slice(0, 5);

      // populate stats used in template
      this.stats.totalBookings = totalBookings;
      this.stats.totalCustomers = numCustomers;
      // now show revenue for the selected period (filteredRevenue). Keep overall available if needed elsewhere.
      this.stats.totalRevenue = filteredRevenue || totalRevenueOverall || 0;
      this.stats.mostBookedVenue = mostBookedFilteredName || (mostBooked?.venueName || '–');
      this.stats.bestRevenueVenue = bestRevenue?.venue?.venueName || '–';
      this.stats.completedBookings = completedCount;
      this.stats.topCustomer = { name: topCustomerName || '–', bookings: topCustomerBookings || 0 };

      this.reportData = { startDate, endDate, platforms: [{name:'Bookings',value: totalBookings},{name:'Revenue',value: this.stats.totalRevenue}], items };

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
    const dObj = this.getBookingDateObj(b);
    if (!dObj) return false;
    const year = dObj.getFullYear();
    const month = dObj.getMonth() + 1;
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

  setTimeout(() => {
    html2canvas(this.reportContent.nativeElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    }).then(canvas => {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      while (heightLeft > 0) {
        const pageHeight = Math.min(heightLeft, pdfHeight);
        const canvasPage = document.createElement('canvas');
        canvasPage.width = canvas.width;
        canvasPage.height = (pageHeight * canvas.width) / imgWidth;

        const ctx = canvasPage.getContext('2d');
        if (ctx) {
          ctx.drawImage(
            canvas,
            0, (imgHeight - heightLeft) * (canvas.height / imgHeight),
            canvas.width, canvasPage.height,
            0, 0,
            canvas.width, canvasPage.height
          );
        }

        const pageData = canvasPage.toDataURL('image/png');
        pdf.addImage(pageData, 'PNG', 0, 0, imgWidth, pageHeight);

        heightLeft -= pdfHeight;
        if (heightLeft > 0) pdf.addPage();
      }

      pdf.save(`venue-report-${this.reportType}-${this.selectedYear}.pdf`);
    });
  }, 300);
}



  printReports() {
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
  printReport() {
  if (!this.reportContent) return;

  const printContents = this.reportContent.nativeElement.innerHTML;
  const originalContents = document.body.innerHTML;

  // Replace body content with report content only
  document.body.innerHTML = `
    <html>
      <head>
        <title>Print Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: white;
            color: #000;
            margin: 0;
            padding: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 6px;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .border { border: 1px solid #ddd; }
          .p-3 { padding: 12px; }
        </style>
      </head>
      <body>
        ${printContents}
      </body>
    </html>
  `;

  window.print();
  // restore original page after printing
  document.body.innerHTML = originalContents;
  window.location.reload(); // reload to restore Angular bindings
}

}
