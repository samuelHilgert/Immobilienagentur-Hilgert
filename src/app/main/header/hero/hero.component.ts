import { Component } from '@angular/core';
import { HeaderInfoBoxComponent } from './header-info-box/header-info-box.component';
import { NavbarComponent } from './navbar/navbar.component';

@Component({
  selector: 'app-hero',
  standalone:true,
  imports: [HeaderInfoBoxComponent, NavbarComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent {

}
