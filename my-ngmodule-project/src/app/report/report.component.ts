import { Component } from '@angular/core';

@Component({
  selector: 'app-report',
  standalone:false,
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent {
  // Chart Data
  chartData = {
    labels: ['Pending', 'In Progress', 'Complete', 'Cancelled', 'Expired'],
    datasets: [
      {
        label: 'Bookings Status (Yearly)',
        data: [1, 0, 5, 4, 46],
        backgroundColor: ['#fbbf24', '#3b82f6', '#22c55e', '#ef4444', '#6b7280'],
        borderRadius: 8
      }
    ]
  };

  chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'bottom' },
      title: { display: true, text: 'Booking Status Report (2025)' }
    }
  };

  // Summary Data
  summary = {
    totalBookings: 56,
    totalCustomers: 26,
    totalRevenue: 900,
    revenueThisMonth: 900,
    mostBookedVenue: 'MICHENZANI MALL HALL',
    topCompleteVenue: 'MICHENZANI MALL HALL',
    bestRevenueVenue: {
      name: 'MICHENZANI MALL HALL',
      capacity: 32222250,
      revenue: 800
    },
    topVenuesByRevenue: [
      { name: 'MICHENZANI MALL HALL', revenue: 800 },
      { name: 'OPEN THEATER', revenue: 100 }
    ]
  };
}
