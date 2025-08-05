import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone:true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    TranslateModule,
    
   
  ],
  exportAs: 'appHeader'
})
export class HeaderComponent {
  isHomePage = false;
  isBookingPage = false;
  menuOpen = false;
  fullTitle = '';
  displayedText = ''; 
  isAnimating = false;
showLangDropdown = false;
currentLang = 'en'; // default
  currentDate: string;


  constructor(
    private router: Router,
    private translate: TranslateService
  ) {
    // Add supported languages
    this.translate.addLangs(['en', 'sw']);
    // Set default language
    this.translate.setDefaultLang('en');

    // Use language saved in localStorage or fallback to 'en'
    const lang = localStorage.getItem('app_language') ?? 'en';
    this.translate.use(lang);

    // Format current date with localization - adjust locale dynamically if needed
    this.currentDate = new Date().toLocaleDateString(
      lang === 'sw' ? 'sw-TZ' : 'en-GB',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }
    );

    // Listen to router navigation to update active page flags
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const currentUrl = event.urlAfterRedirects;
        this.isHomePage = currentUrl.startsWith('/venue');
        this.isBookingPage = currentUrl.startsWith('/mybooking');
      });
  }

  goHome(): void {
    this.router.navigate(['/venue']);
  }

  gomybooking(): void {
    this.router.navigate(['/mybooking']);
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  switchLanguage(lang: string): void {
    if (this.isAnimating) return;
     this.currentLang = lang;  
    this.translate.use(lang);
    localStorage.setItem('app_language', lang);
    this.setAnimatedTitle(); 
    

    // Update currentDate formatting immediately on language switch
    this.currentDate = new Date().toLocaleDateString(
      lang === 'sw' ? 'sw-TZ' : 'en-GB',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }
    );
  }
   ngOnInit(): void {
    // Get translated title and start animation
    this.translate.get('header.title').subscribe((res: string) => {
      this.fullTitle = res;
      this.displayedText = '';
      this.animateText();
  

    });
  }

  animateText(index: number = 0): void {
    if (index < this.fullTitle.length) {
      this.displayedText += this.fullTitle.charAt(index);
      setTimeout(() => this.animateText(index + 1), 80); // speed in ms
    }
    else {
      this.isAnimating = false;
    }
  }
setAnimatedTitle(): void {
   if (this.isAnimating) return;
  this.translate.get('header.title').subscribe(res => {
    console.log('Translated title:', res); // check the output here
    this.fullTitle = res;
    this.displayedText = '';
    this.isAnimating = true;
    this.animateText(0);
  });
}

switchLanguageFromEvent(event: Event) {
  const selectElement = event.target as HTMLSelectElement;
  this.switchLanguage(selectElement.value);
}

}
