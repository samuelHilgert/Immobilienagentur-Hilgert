import { Component } from '@angular/core';
import { AngeboteComponent } from './angebote/angebote.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { RouterModule } from '@angular/router';
import { BewertungenComponent } from './bewertungen/bewertungen.component';
import { PartnerComponent } from './partner/partner.component';
import { KontaktSectionComponent } from './kontakt-section/kontakt-section.component';
import { IntroTextComponent } from './intro-text/intro-text.component';

@Component({
  selector: 'app-main',
  standalone:true,
  imports: [IntroTextComponent, AngeboteComponent, BewertungenComponent, AboutUsComponent, KontaktSectionComponent, RouterModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})

export class MainComponent {

}
