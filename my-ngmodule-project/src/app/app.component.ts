import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})

export class AppComponent {
  title = 'zssf-project';
  isLoading = true;


  constructor(router: Router) {
      // console.log(router.config);
  }
ngOnInit() {
    // Simulate loading delay (e.g., wait for services)
    setTimeout(() => {
      this.isLoading = false;
    }, 1000); // Adjust time or use actual API loading
  }
}
