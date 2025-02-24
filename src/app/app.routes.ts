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

export const routes: Routes = [
  {
    path: '',
    component: MainComponent,
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
