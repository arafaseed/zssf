import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // To navigate after successful login

@Component({
  selector: 'app-login',
  standalone:false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  staffId: string = '';
  password: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Initialize any necessary logic or data
  }

  // Define the onSubmit method that will be triggered on form submission
  onSubmit() {
    // Implement your login logic here
    // For example, check if the staffId and password match some predefined credentials
    if (this.staffId === 'admin' && this.password === 'admin') {
      // Set role in localStorage and redirect to admin dashboard
      localStorage.setItem('role', 'admin');
      this.router.navigate(['/admin']);
    } else if (this.staffId === 'staff001' && this.password === 'password123') {
      // Set role in localStorage and redirect to staff dashboard
      localStorage.setItem('role', 'staff');
      this.router.navigate(['/staff-dashboard']);
    } else {
      // Handle invalid credentials
      alert('Invalid Staff ID or Password!');
    }
  }
}
