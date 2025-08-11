export interface ExposePreview {
  exposeAccessLevel?: 'normal' | 'gekürzt' | 'erweitert';
  customerId?: string;
  propertyExternalId?: string;
  salutation?: string;
  firstName?: string;
  lastName?: string;
  blocked?: boolean; // 👈 neu: Zugang gesperrt ja/nein - da sonst property-inquiry-process gelesen werden muss (nicht öffentlich)
}
