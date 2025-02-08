import { Component } from '@angular/core';
import { LogoComponent } from './logo/logo.component';
import { HeroComponent } from './hero/hero.component';
import { SidebarClickBewertungComponent } from '../../shared/sidebar-click-bewertung/sidebar-click-bewertung.component';

@Component({
  selector: 'app-header',
  standalone:true,
  imports: [LogoComponent, HeroComponent, SidebarClickBewertungComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

}
