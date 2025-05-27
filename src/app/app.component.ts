import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { FooterComponent } from './shared/footer/footer.component';
import { HeaderComponent } from './shared/header/header.component';
import { CommonModule } from '@angular/common';
import { HeroComponent } from './shared/hero/hero.component';
import { SidebarClickBewertungComponent } from './shared/sidebar-click-bewertung/sidebar-click-bewertung.component';
import { BottomFixedLineComponent } from './shared/bottom-fixed-line/bottom-fixed-line.component';
import { filter } from 'rxjs/operators';
import { ScrollService } from './services/scroll.service';
import { AuthService } from './services/auth.service';
import { getAuth, signInAnonymously } from 'firebase/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HeaderComponent, HeroComponent, FooterComponent, SidebarClickBewertungComponent, BottomFixedLineComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  isLoading = true; // ⏳ Startet mit "Laden"
  routesIsActive = true;

  constructor(private router: Router,
    private scrollService: ScrollService,
    private authService: AuthService) {
    }

  ngOnInit() {
    const auth = getAuth();

    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log('✅ Benutzer ist bereits eingeloggt:', user.uid);
      } else {
        signInAnonymously(auth)
          .then((cred) => console.log('✅ Anonym eingeloggt:', cred.user.uid))
          .catch((err) => console.error('❌ Anonyme Anmeldung fehlgeschlagen:', err));
      }
    });
    
    this.checkCurrentRoute(this.router.url);
  
    this.router.events.pipe(
      filter((event: RouterEvent): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.checkCurrentRoute(event.urlAfterRedirects);
      setTimeout(() => {
        this.isLoading = false;
      }, 300);
    });
  
    // 👇 Header-Sichtbarkeit anhand Scrollverhalten steuern
    this.scrollService.headerVisibility.subscribe(show => {
      const header = document.querySelector('header');
      if (header) {
        header.classList.toggle('hidden', !show);
      }
    });
  }

  private checkCurrentRoute(url: string): void {
    // Entferne den Hash vom URL für den Vergleich
    const cleanUrl = url.split('#')[0];
    
    // Prüfe ob die gereinigte URL die Startseite ist
    const isHomePage = cleanUrl === '/' || cleanUrl === '';
    
    // Prüfe auf Hash-Fragment für #kontakt
    const isKontaktFragment = url.includes('#kontakt');
    
    // Hero anzeigen wenn Startseite oder Kontakt-Fragment
    this.routesIsActive = !(isHomePage || isKontaktFragment);
  }

  isDashboardRoute(): boolean {
    return this.router.url.startsWith('/dashboard');
  }
}