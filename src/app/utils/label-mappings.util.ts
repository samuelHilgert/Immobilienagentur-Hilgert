// src/app/utils/label-mappings.ts

export const apartmentTypeLabels = {
  ROOF_STOREY: 'Dachgeschoss',
  LOFT: 'Loft',
  MAISONETTE: 'Maisonette',
  PENTHOUSE: 'Penthouse',
  TERRACED_FLAT: 'Terrassenwohnung',
  GROUND_FLOOR: 'Erdgeschosswohnung',
  APARTMENT: 'Etagenwohnung',
  RAISED_GROUND_FLOOR: 'Hochparterre',
  HALF_BASEMENT: 'Souterrain',
  OTHER: 'Sonstiges',
  NO_INFORMATION: 'Keine Angabe',
};

export const buildingTypeLabels = {
  NO_INFORMATION: 'Keine Angabe',
  SINGLE_FAMILY_HOUSE: 'Einfamilienhaus',
  MID_TERRACE_HOUSE: 'Reihenmittelhaus',
  END_TERRACE_HOUSE: 'Reihenendhaus',
  MULTI_FAMILY_HOUSE: 'Mehrfamilienhaus',
  BUNGALOW: 'Bungalow',
  FARMHOUSE: 'Bauernhaus',
  SEMIDETACHED_HOUSE: 'Doppelhaushälfte',
  VILLA: 'Villa',
  CASTLE_MANOR_HOUSE: 'Schloss / Herrenhaus',
  SPECIAL_REAL_ESTATE: 'Spezialimmobilie',
  OTHER: 'Sonstige',
};

export const Yes_No_Labels: { [key: string]: string } = {
  YES: 'Ja',
  NOT_APPLICABLE: 'Nein',
};

export const True_False_Labels: { [key: string]: string } = {
  true: 'Ja',
  false: 'Nein',
};

export const conditionLabels: { [key: string]: string } = {
  NO_INFORMATION: 'Keine Angabe',
  FIRST_TIME_USE: 'Erstbezug',
  FIRST_TIME_USE_AFTER_REFURBISHMENT: 'Erstbezug nach Sanierung',
  MINT_CONDITION: 'Neuwertig',
  REFURBISHED: 'Saniert',
  MODERNIZED: 'Modernisiert',
  FULLY_RENOVATED: 'Komplett renoviert',
  WELL_KEPT: 'Gepflegt',
  NEED_OF_RENOVATION: 'Renovierungsbedürftig',
  NEGOTIABLE: 'Verhandlungsbasis',
  RIPE_FOR_DEMOLITION: 'Abrissobjekt',
};
export const constructionPhaseLabels: { [key: string]: string } = {
  PROJECTED: 'Haus in Planung',
  UNDER_CONSTRUCTION: 'Haus im Bau',
  COMPLETED: 'Haus fertig gestellt',
  NO_INFORMATION: 'Keine Angabe',
};
export const interiorQualityLabels: { [key: string]: string } = {
  NO_INFORMATION: 'Keine Angabe',
  LUXURY: 'Luxusausstattung',
  SOPHISTICATED: 'Gehoben',
  NORMAL: 'Normal',
  SIMPLE: 'Einfach',
};
export const heatingTypeLabels: { [key: string]: string } = {
  NO_INFORMATION: 'Keine Angabe',
  SELF_CONTAINED_CENTRAL_HEATING: 'Etagenheizung',
  STOVE_HEATING: 'Ofenheizung',
  CENTRAL_HEATING: 'Zentralheizung',
  COMBINED_HEAT_AND_POWER_PLANT: 'Blockheizkraftwerk',
  ELECTRIC_HEATING: 'Elektro-Heizung',
  DISTRICT_HEATING: 'Fernwärme',
  FLOOR_HEATING: 'Fußbodenheizung',
  GAS_HEATING: 'Gas-Heizung',
  WOOD_PELLET_HEATING: 'Holz-Pelletheizung',
  NIGHT_STORAGE_HEATER: 'Nachtspeicherofen',
  OIL_HEATING: 'Öl-Heizung',
  SOLAR_HEATING: 'Solar-Heizung',
  HEAT_PUMP: 'Wärmepumpe',
};

export const firingTypeLabels: { [key: string]: string } = {
  NO_INFORMATION: 'Keine Angabe',
  GEOTHERMAL: 'Erdwärme',
  SOLAR_HEATING: 'Solarheizung',
  PELLET_HEATING: 'Pelletheizung',
  GAS: 'Gas',
  OIL: 'Öl',
  ELECTRICITY: 'Strom',
  COAL: 'Kohle',
};
export const parkingSpaceTypeLabels: { [key: string]: string } = {
  NO_INFORMATION: 'Keine Angabe',
  GARAGE: 'Garage',
  OUTSIDE: 'Außenstellplatz',
  CARPORT: 'Carport',
  DUPLEX: 'Duplex',
  CAR_PARK: 'Parkhaus',
  UNDERGROUND_GARAGE: 'Tiefgarage',
};
export const buildingEnergyRatingTypeLabels: { [key: string]: string } = {
  NO_INFORMATION: 'Keine Angabe',
  ENERGY_REQUIRED: 'Energiebedarfsausweis',
  ENERGY_CONSUMPTION: 'Energieverbrauchsausweis',
};
