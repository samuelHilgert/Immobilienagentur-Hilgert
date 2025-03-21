import { Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { DashboardLoginComponent } from './dashboard-login/dashboard-login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './services/auth.guard';
import { ImmobilieAnlegenComponent } from './dashboard/immobilien/immobilie-anlegen/immobilie-anlegen.component';
import { ImmobilienComponent } from './dashboard/immobilien/immobilien.component';
import { KundendatenbankComponent } from './dashboard/kundendatenbank/kundendatenbank.component';
import { SuchauftraegeComponent } from './dashboard/suchauftraege/suchauftraege.component';
import { BewertungenComponent } from './dashboard/bewertungen/bewertungen.component';
import { NewsletterComponent } from './dashboard/newsletter/newsletter.component';
import { PartnerAnlegenComponent } from './dashboard/partner/partner-anlegen/partner-anlegen.component';
import { SocialMediaComponent } from './dashboard/social-media/social-media.component';
import { WerbungComponent } from './dashboard/werbung/werbung.component';
import { AblageComponent } from './dashboard/ablage/ablage.component';
import { PartnerComponent } from './dashboard/partner/partner.component';
import { KundeAnlegenComponent } from './dashboard/kundendatenbank/kunde-anlegen/kunde-anlegen.component';
import { SuchauftragAnlegenComponent } from './dashboard/suchauftraege/suchauftrag-anlegen/suchauftrag-anlegen.component';
import { BewertungAnlegenComponent } from './dashboard/bewertungen/bewertung-anlegen/bewertung-anlegen.component';
import { ImmobilienangeboteComponent } from './immobilienangebote/immobilienangebote.component';
import { LeistungenComponent } from './leistungen/leistungen.component';
import { ReferenzenComponent } from './referenzen/referenzen.component';
import { ImmobilienbewertungComponent } from './immobilienbewertung/immobilienbewertung.component';
import { BewertungAbgebenComponent } from './bewertung-abgeben/bewertung-abgeben.component';
import { ImpressumComponent } from './impressum/impressum.component';
import { SuchanfrageComponent } from './suchanfrage/suchanfrage.component';
import { TippgeberComponent } from './tippgeber/tippgeber.component';
import { ImmobilieVorstellenComponent } from './immobilie-vorstellen/immobilie-vorstellen.component';
import { PartnerWerdenComponent } from './partner-werden/partner-werden.component';
import { MagazinComponent } from './magazin/magazin.component';
import { DatenschutzComponent } from './impressum/datenschutz/datenschutz.component';
import { AgbComponent } from './impressum/agb/agb.component';
import { KontaktComponent } from './kontakt/kontakt.component';

export const routes: Routes = [
  {
    path: '',
    component: MainComponent,
  },
  {
    path: 'immobilienangebote',
    component: ImmobilienangeboteComponent,
  },
  {
    path: 'leistungen',
    component: LeistungenComponent,
  },
  {
    path: 'referenzen',
    component: ReferenzenComponent,
  },
  {
    path: 'immobilienbewertung',
    component: ImmobilienbewertungComponent,
  },
  {
    path: 'kontakt',
    component: KontaktComponent,
  },
  {
    path: 'magazin',
    component: MagazinComponent,
  },
  {
    path: 'suchanfrage',
    component: SuchanfrageComponent,
  },
  {
    path: 'tippgeber',
    component: TippgeberComponent,
  },
  {
    path: 'bewertung-abgeben',
    component: BewertungAbgebenComponent,
  },
  {
    path: 'immobilie-vorstellen',
    component: ImmobilieVorstellenComponent,
  },
  {
    path: 'partner-werden',
    component: PartnerWerdenComponent,
  },
  {
    path: 'impressum',
    component: ImpressumComponent,
  },
  {
    path: 'datenschutz',
    component: DatenschutzComponent,
  },
  {
    path: 'agb',
    component: AgbComponent,
  },
  {
    path: 'dashboard-login',
    component: DashboardLoginComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard], // 🔐 Schützt das Dashboard
    children: [
      // 👈 Nested Routes innerhalb des Dashboards!
      {
        path: 'immobilien',
        component: ImmobilienComponent,
        children: [
          { path: 'immobilie-anlegen', component: ImmobilieAnlegenComponent },
        ],
      },
      {
        path: 'suchauftraege',
        component: SuchauftraegeComponent,
        children: [
          { path: 'suchauftrag-anlegen', component: SuchauftragAnlegenComponent },
        ],
      },
      {
        path: 'kundendatenbank',
        component: KundendatenbankComponent,
        children: [{ path: 'kunde-anlegen', component: KundeAnlegenComponent }],
      },
      {
        path: 'bewertungen',
        component: BewertungenComponent,
        children: [
          { path: 'bewertung-anlegen', component: BewertungAnlegenComponent },
        ],
      },
      { path: 'newsletter', component: NewsletterComponent },
      {
        path: 'partner',
        component: PartnerComponent,
        children: [
          { path: 'partner-anlegen', component: PartnerAnlegenComponent },
        ],
      },
      { path: 'social-media', component: SocialMediaComponent },
      { path: 'werbung', component: WerbungComponent },
      { path: 'ablage', component: AblageComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
