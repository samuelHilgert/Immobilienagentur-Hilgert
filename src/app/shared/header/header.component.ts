import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { LogoComponent } from './logo/logo.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ScrollService } from '../../services/scroll.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, LogoComponent, NavbarComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})

export class HeaderComponent implements OnInit, OnDestroy {
  // blendet header aus beim Scrollen
  isVisible = true;
  private subscription: Subscription | null = null;
  ////////

  constructor(
    private scrollService: ScrollService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // blendet header aus beim Scrollen
    this.subscription = this.scrollService.headerVisibility.subscribe(visible => {
      this.isVisible = visible;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}