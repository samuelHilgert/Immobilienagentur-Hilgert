import { Component } from '@angular/core';
import { AngeboteComponent } from './angebote/angebote.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { KontaktComponent } from './kontakt/kontakt.component';
import { RouterModule } from '@angular/router';
import { BewertungenComponent } from './bewertungen/bewertungen.component';
import { PartnerComponent } from './partner/partner.component';

@Component({
  selector: 'app-main',
  standalone:true,
  imports: [AboutUsComponent, AngeboteComponent, BewertungenComponent, PartnerComponent, KontaktComponent, RouterModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})

export class MainComponent {

}
