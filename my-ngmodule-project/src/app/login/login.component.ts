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
      this.router.navigate(['/admin/']);
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
// import { Component, OnInit } from '@angular/core';
// import { Router } from '@angular/router';
// import { HttpClient, HttpHeaders } from '@angular/common/http'; // Import HttpClient

// @Component({
//   selector: 'app-login',
//   standalone: false,
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.css']
// })
// export class LoginComponent implements OnInit {
//   staffId: string = '';
//   password: string = '';

//   constructor(private router: Router, private http: HttpClient) {}

//   ngOnInit(): void {
//     // Initialization logic if needed
//   }

//   onSubmit() {
//     const loginRequest = {
//       staffId: this.staffId,
//       password: this.password
//     };
  
//     this.http.post('http://localhost:8080/api/staff/login', loginRequest, {
//       headers: new HttpHeaders().set('Content-Type', 'application/json')
//     })
//     .subscribe(
//       (response) => {
//         console.log('Login successful:', response);
//         // Handle successful login
//       },
//       (error) => {
//         console.error('Login failed:', error);
//         // Handle error (e.g., incorrect credentials)
//       }
//     );
//   }
  
// }
