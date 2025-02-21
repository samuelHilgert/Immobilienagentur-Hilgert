export interface Immobilie {
  id: string;
  titel: string;
  beschreibung?: string;
  preis: string;
  art: string;
  objekt_typ: string;
  status?: string;
  plz?: string;
  stadt?: string;
  erstellt_am?: string;
  aktualisiert_am?: string;
  wohnflaeche?: string;
  grundstuecksflaeche?: string;
  zimmer?: string;
  baujahr?: string;
}


// ✅ NEUES INTERFACE für Häuser
export interface HausDetails {
  immobilie_id: string;
  externalId?: string;
  title: string;
  street: string;
  houseNumber: string;
  postcode: string;
  city: string;
  descriptionNote?: string;
  furnishingNote?: string;
  locationNote?: string;
  otherNote?: string;
  showAddress: boolean;
  buildingType: 'NO_INFORMATION' | 'SINGLE_FAMILY_HOUSE' | 'MID_TERRACE_HOUSE' | 'END_TERRACE_HOUSE' | 'MULTI_FAMILY_HOUSE' | 'BUNGALOW' | 'FARMHOUSE' | 'SEMIDETACHED_HOUSE' | 'VILLA' | 'CASTLE_MANOR_HOUSE' | 'SPECIAL_REAL_ESTATE' | 'OTHER';
  numberOfRooms: string;
  constructionYear?: number;
  energyPerformanceCertificate: boolean;
  heatingType?: 'NO_INFORMATION' | 'SELF_CONTAINED_CENTRAL_HEATING' | 'STOVE_HEATING' | 'CENTRAL_HEATING' | 'COMBINED_HEAT_AND_POWER_PLANT' | 'ELECTRIC_HEATING' | 'DISTRICT_HEATING' | 'FLOOR_HEATING' | 'GAS_HEATING' | 'WOOD_PELLET_HEATING' | 'NIGHT_STORAGE_HEATER' | 'OIL_HEATING' | 'SOLAR_HEATING' | 'HEAT_PUMP';
  latitude?: number;
  longitude?: number;
}
