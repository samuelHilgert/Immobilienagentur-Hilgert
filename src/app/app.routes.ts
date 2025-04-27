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
import { BewertenComponent } from './shared/feedback/feedback.component';
import { AlleImmobilienComponent } from './alle-immobilien/alle-immobilien.component';
import { ExposeAnfordernComponent } from './shared/expose-anfordern/expose-anfordern.component';
import { WiderrufComponent } from './impressum/widerruf/widerruf.component';
import { FeedbackForCashComponent } from './shared/feedback/feedback-for-cash/feedback-for-cash.component';
import { GrundstueckDetailsFormComponent } from './dashboard/immobilien/immobilien-datenbank/grundstueck-details-form/grundstueck-details-form.component';
import { HausDetailsFormComponent } from './dashboard/immobilien/immobilien-datenbank/haus-details-form/haus-details-form.component';
import { WohnungDetailsFormComponent } from './dashboard/immobilien/immobilien-datenbank/wohnung-details-form/wohnung-details-form.component';
import { KundeDetailsComponent } from './dashboard/kundendatenbank/kunde-details/kunde-details.component';
import { ExposeAnfragenDatenbankComponent } from './dashboard/immobilien/immobilien-datenbank/expose-anfragen-datenbank/expose-anfragen-datenbank.component';
import { UmsatzComponent } from './dashboard/umsatz/umsatz.component';
import { SupportTicketsComponent } from './dashboard/support-tickets/support-tickets.component';
import { ImmobilienDatenbankComponent } from './dashboard/immobilien/immobilien-datenbank/immobilien-datenbank.component';
import { PropertyProcessViewComponent } from './dashboard/immobilien/immobilien-datenbank/shared/property-process-view/property-process-view.component';
import { PropertyFormsSetsComponent } from './dashboard/immobilien/immobilien-datenbank/shared/property-forms-sets/property-forms-sets.component';
import { PropertyDocsSetsComponent } from './dashboard/immobilien/immobilien-datenbank/shared/property-docs-sets/property-docs-sets.component';
import { PropertyImagesSetsComponent } from './dashboard/immobilien/immobilien-datenbank/shared/property-images-sets/property-images-sets.component';
import { PropertyExposeSetsComponent } from './dashboard/immobilien/immobilien-datenbank/shared/property-expose-sets/property-expose-sets.component';

export const routes: Routes = [
  {
    path: '',
    component: MainComponent,
  },
  {
    path: 'immobilien',
    component: AlleImmobilienComponent,
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
  { path: 'expose-anfordern', 
    component: ExposeAnfordernComponent 
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
    path: 'bewerten',
    component: BewertenComponent,
  },
  {
    path: 'feedback',
    component: FeedbackForCashComponent,
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
    path: 'widerruf',
    component: WiderrufComponent,
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
          {
            path: 'immobilie-anlegen',
            component: ImmobilieAnlegenComponent
          },
          {
            path: 'immobilie-datenbank',
            component: ImmobilienDatenbankComponent,
          },
          {
            path: 'wohnung-details-form/:externalId',
            component: WohnungDetailsFormComponent,
          },
          {
            path: 'haus-details-form/:externalId',
            component: HausDetailsFormComponent,
          },
          {
            path: 'grundstueck-details-form/:externalId',
            component: GrundstueckDetailsFormComponent,
          },      
        ]
      },      
      {
        path: 'property-process-view/:externalId',
        component: PropertyProcessViewComponent
      },
      {
        path: 'expose-anfragen-datenbank/:externalId',
        component: ExposeAnfragenDatenbankComponent,
      },     
      {
        path: 'property-expose-sets/:externalId',
        component: PropertyExposeSetsComponent
      },
      {
        path: 'property-images-sets/:externalId',
        component: PropertyImagesSetsComponent
      },
      {
        path: 'property-docs-sets/:externalId',
        component: PropertyDocsSetsComponent
      },
      {
        path: 'property-forms-sets/:externalId',
        component: PropertyFormsSetsComponent
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
      },
      {
        path: 'umsatz',
        component: UmsatzComponent,
      },
      {
        path: 'support-tickets',
        component: SupportTicketsComponent,
      },
      {
        path: 'kunde-anlegen',
        component: KundeAnlegenComponent
      },
      {
        path: 'kunde-details/:id',
        component: KundeDetailsComponent
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
