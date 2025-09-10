import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-terms-and-conditions',
  standalone: false,
  templateUrl: './terms-and-conditions.component.html',
  styleUrls: ['./terms-and-conditions.component.css']
})
export class TermsAndConditionsComponent implements OnInit, OnDestroy {
  translation: any = {};
  lastUpdated: string = '';
  currentLang: string = 'en';
  sections = [
    'intro','scope','booking','payment','cancellation',
    'responsibilities','prohibited','liability','privacy',
    'modifications','law'
  ];

  private langChangeSub?: Subscription;

  constructor(private http: HttpClient, private translate: TranslateService) {
    this.translate.addLangs(['en', 'sw']);
    this.translate.setDefaultLang('en');

    const savedLang = localStorage.getItem('app_language') ?? 'en';
    this.currentLang = savedLang;
    this.translate.use(savedLang);
  }

  ngOnInit(): void {
    this.loadTranslation(this.currentLang);
    this.updateLastUpdated(this.currentLang);

    // Listen for language change events
    this.langChangeSub = this.translate.onLangChange.subscribe(
      (event: LangChangeEvent) => {
        this.currentLang = event.lang;
        this.loadTranslation(event.lang);
        this.updateLastUpdated(event.lang);
      }
    );
  }

  ngOnDestroy(): void {
    this.langChangeSub?.unsubscribe();
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
    this.translate.use(lang); // this will trigger onLangChange automatically
  }

  private updateLastUpdated(lang: string) {
    const today = new Date();
    this.lastUpdated = today.toLocaleDateString(
      lang === 'sw' ? 'sw-TZ' : 'en-GB',
      { year: 'numeric', month: 'long', day: 'numeric' }
    );
  }
}
