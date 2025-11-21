// import { Component, OnInit } from '@angular/core';

// import { ChartConfiguration } from 'chart.js';
// import { Booking, BookingService } from '../Services/booking.service';

// @Component({
//   selector: 'app-report',
//   standalone: false,
//   templateUrl: './report.component.html',
//   styleUrls: ['./report.component.css']
// })
// export class ReportComponent implements OnInit {
//   bookings: Booking[] = [];

//   selectedPeriod: 'monthly' | 'quarterly' | 'yearly' = 'monthly';

//   chartData: ChartConfiguration<'bar'>['data'] = {
//     labels: [],
//     datasets: [
//       { label: 'Pending', data: [], backgroundColor: '#fbbf24', borderRadius: 8 },
//       { label: 'In Progress', data: [], backgroundColor: '#3b82f6', borderRadius: 8 },
//       { label: 'Complete', data: [], backgroundColor: '#22c55e', borderRadius: 8 },
//       { label: 'Cancelled', data: [], backgroundColor: '#ef4444', borderRadius: 8 },
//       { label: 'Expired', data: [], backgroundColor: '#6b7280', borderRadius: 8 },
//     ]
//   };

//   chartOptions: ChartConfiguration<'bar'>['options'] = {
//     responsive: true,
//     plugins: {
//       legend: { display: true, position: 'bottom' },
//       title: { display: true, text: 'Booking Status Report' }
//     },
//     scales: {
//       y: { beginAtZero: true }
//     }
//   };

  

//   constructor(private bookingService: BookingService) {}

//   ngOnInit() {
//     this.bookingService.fetchBookings().subscribe({
//       next: (data) => {
//         this.bookings = data || [];
//         this.updateChartData();
//       },
//       error: (err) => console.error('Failed to load bookings:', err)
//     });
//   }

//   /** 🟢 Build chart data grouped by period */
//   updateChartData() {
//     const grouped = this.groupBookingsByPeriod(this.selectedPeriod);
//     this.chartData.labels = Object.keys(grouped);

//    for (let dataset of this.chartData.datasets) {
//   const key = (dataset.label ?? '').toUpperCase().replace(' ', '_');
//   dataset.data = Object.keys(grouped).map(period => grouped[period][key] || 0);
// }

//   }

//   /** 🟢 Group bookings into monthly / quarterly / yearly buckets */
//   groupBookingsByPeriod(period: 'monthly' | 'quarterly' | 'yearly') {
//     const result: any = {};
//     for (const b of this.bookings) {
//       if (!b.startDate) continue;
//       const date = new Date(b.startDate);
//       let key = '';

//       if (period === 'monthly') {
//         key = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
//       } else if (period === 'quarterly') {
//         const q = Math.floor(date.getMonth() / 3) + 1;
//         key = `Q${q} ${date.getFullYear()}`;
//       } else {
//         key = `${date.getFullYear()}`;
//       }

//       if (!result[key]) {
//         result[key] = { PENDING: 0, IN_PROGRESS: 0, COMPLETE: 0, CANCELLED: 0, EXPIRED: 0 };
//       }
//       const s = b.bookingStatus?.toUpperCase().replace(' ', '_');
//       if (result[key][s] !== undefined) result[key][s]++;
//     }
//     return result;
//   }

 
// }
