import { Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { DashboardLoginComponent } from './dashboard-login/dashboard-login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './services/auth.guard';
import { ImmobilieAnlegenComponent } from './dashboard/immobilien/immobilie-anlegen/immobilie-anlegen.component';
import { ImmobilienComponent } from './dashboard/immobilien/immobilien.component';
import { KundendatenbankComponent } from './dashboard/kundendatenbank/kundendatenbank.component';
import { SuchauftraegeComponent } from './dashboard/suchauftraege/suchauftraege.component';
import { NewsletterComponent } from './dashboard/newsletter/newsletter.component';
import { PartnerAnlegenComponent } from './dashboard/partner/partner-anlegen/partner-anlegen.component';
import { SocialMediaComponent } from './dashboard/social-media/social-media.component';
import { WerbungComponent } from './dashboard/werbung/werbung.component';
import { AblageComponent } from './dashboard/ablage/ablage.component';
import { PartnerComponent } from './dashboard/partner/partner.component';
import { KundeAnlegenComponent } from './dashboard/kundendatenbank/kunde-anlegen/kunde-anlegen.component';
import { SuchauftragAnlegenComponent } from './dashboard/suchauftraege/suchauftrag-anlegen/suchauftrag-anlegen.component';
import { DatenschutzComponent } from './imprint/datenschutz/datenschutz.component';
import { AgbComponent } from './imprint/agb/agb.component';
import { BewertenComponent } from './shared/feedback/feedback.component';
import { ExposeAnfordernComponent } from './shared/expose-anfordern/expose-anfordern.component';
import { WiderrufComponent } from './imprint/widerruf/widerruf.component';
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
import { ProtocolInquiryPropertyComponent } from './dashboard/immobilien/protocol-inquiry-property/protocol-inquiry-property.component';
import { EpxosePreviewComponent } from './shared/epxose-preview/epxose-preview.component';
import { DashStartComponent } from './dashboard/dash-start/dash-start.component';
import { ExposeAccessDeniedComponent } from './shared/expose-access-denied/expose-access-denied.component';
import { DashFeedbacksComponent } from './dashboard/dash-feedbacks/dash-feedbacks.component';
import { DashAddFeedbackComponent } from './dashboard/dash-feedbacks/dash-add-feedback/dash-add-feedback.component';
import { ViewingConfirmationComponent } from './shared/viewing-confirmation/viewing-confirmation.component';
import { CarRidesComponent } from './dashboard/car-rides/car-rides.component';
import { AllPropertiesComponent } from './all-properties/all-properties.component';
import { ContactComponent } from './contact/contact.component';
import { WorkPresentationComponent } from './work-presentation/work-presentation.component';
import { PropertiesReferencesComponent } from './properties-references/properties-references.component';
import { MarketValueCalcComponent } from './market-value-calc/market-value-calc.component';
import { ImprintComponent } from './imprint/imprint.component';

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
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: DashStartComponent,
      },
      {
        path: 'immobilien',
        component: ImmobilienComponent,
        children: [
          {
            path: '',
            component: ImmobilienDatenbankComponent,
          },
          {
            path: 'immobilie-anlegen',
            component: ImmobilieAnlegenComponent,
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
        ],
      },
      {
        path: 'property-process-view/:externalId',
        component: PropertyProcessViewComponent,
      },
      {
        path: 'expose-anfragen-datenbank/:externalId',
        component: ExposeAnfragenDatenbankComponent,
      },
      {
        path: 'property-expose-sets/:externalId',
        component: PropertyExposeSetsComponent,
      },
      {
        path: 'property-images-sets/:externalId',
        component: PropertyImagesSetsComponent,
      },
      {
        path: 'property-docs-sets/:externalId',
        component: PropertyDocsSetsComponent,
      },
      {
        path: 'property-forms-sets/:externalId',
        component: PropertyFormsSetsComponent,
      },
      {
        path: 'suchauftraege',
        component: SuchauftraegeComponent,
        children: [
          {
            path: 'suchauftrag-anlegen',
            component: SuchauftragAnlegenComponent,
          },
        ],
      },
      {
        path: 'kundendatenbank',
        component: KundendatenbankComponent,
      },
      {
        path: 'protocol-inquiry-property/:customerId/:externalId',
        component: ProtocolInquiryPropertyComponent,
      },
      {
        path: 'umsatz',
        component: UmsatzComponent,
      },
      {
        path: 'car-rides',
        component: CarRidesComponent,
      },
      {
        path: 'support-tickets',
        component: SupportTicketsComponent,
      },
      {
        path: 'kunde-anlegen',
        component: KundeAnlegenComponent,
      },
      {
        path: 'kunde-details/:id',
        component: KundeDetailsComponent,
      },
      {
        path: 'dash-feedback',
        component: DashFeedbacksComponent,
        children: [
          { path: 'dash-add-feedback', component: DashAddFeedbackComponent },
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
  {
    path: 'immobilien',
    component: AllPropertiesComponent,
  },
  {
    path: 'leistungen',
    component: WorkPresentationComponent,
  },
  {
    path: 'referenzen',
    component: PropertiesReferencesComponent,
  },
  {
    path: 'immobilienbewertung',
    component: MarketValueCalcComponent,
  },
  {
    path: 'expose-anfordern',
    component: ExposeAnfordernComponent,
  },
  {
    path: 'expose-preview/:inquiryProcessId',
    component: EpxosePreviewComponent,
  },
  {
    path: 'viewing-confirmation/:viewingConfirmationId',
    component: ViewingConfirmationComponent,
  },
  {
    path: 'expose-access-denied',
    component: ExposeAccessDeniedComponent,
  },
  {
    path: 'kontakt',
    component: ContactComponent,
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
    component: ImprintComponent,
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

  { path: '**', redirectTo: '' },
];
