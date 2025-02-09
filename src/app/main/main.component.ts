import { Component } from '@angular/core';
import { AngeboteComponent } from './angebote/angebote.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { LeistungenComponent } from './leistungen/leistungen.component';
import { AwardsComponent } from './awards/awards.component';
import { KontaktComponent } from './kontakt/kontakt.component';

@Component({
  selector: 'app-main',
  standalone:true,
  imports: [AboutUsComponent, AngeboteComponent, LeistungenComponent, AwardsComponent, KontaktComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {

}
