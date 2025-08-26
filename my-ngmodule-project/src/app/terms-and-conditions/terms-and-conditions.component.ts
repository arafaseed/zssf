import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-terms-and-conditions',
  standalone: false,
  templateUrl: './terms-and-conditions.component.html',
  styleUrls: ['./terms-and-conditions.component.css']
})
export class TermsAndConditionsComponent implements OnInit {
  translation: any = {};
  lastUpdated: string = '';
  currentLang: string = 'en';
  sections = ['intro','scope','booking','payment','cancellation','responsibilities','prohibited','liability','privacy','modifications','law'];

  constructor(private http: HttpClient, private translate: TranslateService) {
    this.translate.addLangs(['en','sw']);
    this.translate.setDefaultLang('en');

    const savedLang = localStorage.getItem('app_language') ?? 'en';
    this.currentLang = savedLang;
    this.translate.use(savedLang);

    this.updateLastUpdated(this.currentLang);
  }

  ngOnInit(): void {
    this.loadTranslation(this.currentLang);
  }

  loadTranslation(lang: string) {
    const path = `assets/i18n/${lang}.json`;
    this.http.get(path).subscribe({
      next: (data: any) => this.translation = data.terms,
      error: err => console.error('Error loading translation', err)
    });
  }

  switchLanguage(lang: string) {
    localStorage.setItem('app_language', lang);
    this.translate.use(lang);
    // Reload page to apply translations globally
    window.location.reload();
  }

  private updateLastUpdated(lang: string) {
    const today = new Date();
    this.lastUpdated = today.toLocaleDateString(
      lang === 'sw' ? 'sw-TZ' : 'en-GB',
      { year: 'numeric', month: 'long', day: 'numeric' }
    );
  }
}