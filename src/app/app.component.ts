import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { FooterComponent } from './shared/footer/footer.component';
import { HeaderComponent } from './shared/header/header.component';
import { CommonModule } from '@angular/common';
import { HeroComponent } from './shared/hero/hero.component';
import { SidebarClickBewertungComponent } from './shared/sidebar-click-bewertung/sidebar-click-bewertung.component';
import { BottomFixedLineComponent } from './shared/bottom-fixed-line/bottom-fixed-line.component';

@Component({
  selector: 'app-root',
  standalone:true,
  imports: [RouterOutlet, CommonModule, HeaderComponent, HeroComponent, FooterComponent, SidebarClickBewertungComponent, BottomFixedLineComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  isLoading = true; // ⏳ Startet mit "Laden"
  
  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      setTimeout(() => {
        this.isLoading = false; // 👌 Sobald die Route fertig ist, das Laden beenden
      }, 300);
    });
  }

  isDashboardRoute(): boolean {
    return this.router.url.startsWith('/dashboard');
  }
}

