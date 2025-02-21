import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { FooterComponent } from './shared/footer/footer.component';
import { HeaderComponent } from './main/header/header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone:true,
  imports: [HeaderComponent, RouterOutlet, FooterComponent, CommonModule],
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

