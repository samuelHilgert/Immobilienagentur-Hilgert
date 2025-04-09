import { Component } from '@angular/core';
import { AngeboteComponent } from './angebote/angebote.component';
import { RouterModule } from '@angular/router';
import { BewertungenComponent } from './bewertungen/bewertungen.component';
import { KontaktSectionComponent } from './kontakt-section/kontakt-section.component';
import { IntroTextComponent } from './intro-text/intro-text.component';

@Component({
  selector: 'app-main',
  standalone:true,
  imports: [IntroTextComponent, AngeboteComponent, BewertungenComponent, KontaktSectionComponent, RouterModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})

export class MainComponent {

}
