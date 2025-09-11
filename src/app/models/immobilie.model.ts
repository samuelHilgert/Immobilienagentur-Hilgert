// ✅ NEUES INTERFACE für Immobilie
export interface Immobilie {
  // teilweise wiederholende aus den Details, weil diese infos für die Kurzvorstellungen wichtig sind
  externalId?: string;
  indexId: number;
  marketingType: 'PURCHASE';
  title: string;
  street: string;
  houseNumber: string;
  postcode: string;
  city: string;
  descriptionNote?: string;
  value: number; // Kaufpreis
  livingSpace: number;
  numberOfRooms: number;
  plotArea: number;
  hasCourtage: 'YES' | 'NO' | 'NOT_APPLICABLE';
  courtage?: string;
  courtageNote?: string;
  creationDate?: string;
  lastModificationDate?: string;

  // eigene Felder ergänzt, weil wichtig für mich
  introNote: string; // Kurzgefasste Objektbeschreibung für Vorstellung
  ownerIds: string[];
  tenantIds?: string[];
  extendedExposeAvailable: boolean;
  representingPersonIds: string[];
  exposePdfUrl?: string | null;
  latitude?: number;
  longitude?: number;
  latitudeWithNo?: number;
  longitudeWithNo?: number;
  propertyType: 'Wohnung' | 'Haus' | 'Grundstück';
  propertyStatus: 'Angebot' | 'Referenz' | 'Reserviert' | 'Bearbeitung';
  uploadPublicTargets: {
    // wo soll es hochgeladen werden
    homepage: boolean;
    immoScout: boolean;
    facebook: boolean;
    instagram: boolean;
    newsletter: boolean;
    magazin: boolean;
  };
  sendCustomerTargets: {
    // für an wen soll es gesendet werden
    investoren: boolean;
    suchende: boolean;
    partner: boolean;
  };
  // expose manuell an Interessenten versenden oder automatisch
  autoExposeSend: boolean;

  // Finanzierungsbeispiel
  debitInterest?: number; // Sollzins
  effectiveInterestRate?: number; // Effektiv
  transferTax?: number; // Grunderwerbsteuer
  notaryFee?: number; // Notargebühren
  courtageNumber?: number; // Maklergebühr
  capitalEmployed?: number; // Eingesetztes Kapital
  fixedInterestRates?: number; // Laufzeit
  fixedMonthlyRate?: number; // Monatliche Gesamtrate
}

// ✅ NEUES INTERFACE für Wohnungen
export interface WohnungDetails {
  externalId?: string;
  marketingType: 'PURCHASE';
  title: string;
  street: string;
  houseNumber: string;
  postcode: string;
  city: string;
  searchField1?: string;
  searchField2?: string;
  searchField3?: string;
  groupNumber?: number;
  descriptionNote?: string;
  furnishingNote?: string;
  locationNote?: string;
  otherNote?: string;
  showAddress: boolean;
  contactId?: string;
  apartmentType?:
    | 'ROOF_STOREY'
    | 'LOFT'
    | 'MAISONETTE'
    | 'PENTHOUSE'
    | 'TERRACED_FLAT'
    | 'GROUND_FLOOR'
    | 'APARTMENT'
    | 'RAISED_GROUND_FLOOR'
    | 'HALF_BASEMENT'
    | 'OTHER'
    | 'NO_INFORMATION';
  floor?: number;
  lift?: boolean;
  cellar?: 'YES' | 'NOT_APPLICABLE';
  handicappedAccessible?: 'YES' | 'NOT_APPLICABLE';
  numberOfParkingSpaces?: string;
  condition?:
    | 'NO_INFORMATION'
    | 'FIRST_TIME_USE'
    | 'FIRST_TIME_USE_AFTER_REFURBISHMENT'
    | 'MINT_CONDITION'
    | 'REFURBISHED'
    | 'MODERNIZED'
    | 'FULLY_RENOVATED'
    | 'WELL_KEPT'
    | 'NEED_OF_RENOVATION'
    | 'NEGOTIABLE'
    | 'RIPE_FOR_DEMOLITION';
  constructionYear?: number;
  constructionYearUnknown?: boolean;
  lastRefurbishment?: string;
  interiorQuality?:
    | 'NO_INFORMATION'
    | 'LUXURY'
    | 'SOPHISTICATED'
    | 'NORMAL'
    | 'SIMPLE';
  freeFrom?: string;
  heatingType?: string;
  firingType?: string;
  buildingEnergyRatingType?:
    | 'NO_INFORMATION'
    | 'ENERGY_REQUIRED'
    | 'ENERGY_CONSUMPTION';
  thermalCharacteristic?: number;
  energyConsumptionContainsWarmWater?: 'YES' | 'NOT_APPLICABLE';
  numberOfFloors?: number;
  usableFloorSpace?: number;
  numberOfBedRooms?: number;
  numberOfBathRooms?: number;
  guestToilet?: 'YES' | 'NOT_APPLICABLE';
  parkingSpaceType?: string;
  rented?: 'YES' | 'NOT_APPLICABLE';
  rentalIncome?: number;
  listed?: 'YES' | 'NOT_APPLICABLE';
  parkingSpacePrice?: number;
  summerResidencePractical?: 'YES' | 'NOT_APPLICABLE';
  tenancy?: number;
  leaseholdInterest?: number;
  value: number;
  currency: 'EUR';
  livingSpace: number;
  numberOfRooms: number;
  builtInKitchen?: boolean;
  balcony?: boolean;
  garden?: boolean;
  hasCourtage: 'YES' | 'NO' | 'NOT_APPLICABLE';
  courtage?: string;
  courtageNote?: string;
  latitude?: number;
  longitude?: number;
  latitudeWithNo?: number;
  longitudeWithNo?: number;
  creationDate?: string;
  lastModificationDate?: string;
  priceIntervalType: 'ONE_TIME_CHARGE';
  energyPerformanceCertificate?: boolean;
  serviceCharge?: number;
  maintenanceReserve?: string;
}

// ✅ NEUES INTERFACE für Häuser
export interface HausDetails {
  externalId?: string;
  marketingType: 'PURCHASE';
  title: string;
  street: string;
  houseNumber: string;
  postcode: string;
  city: string;
  descriptionNote?: string;
  value: number; // Kaufpreis
  livingSpace: number;
  numberOfRooms: number;
  plotArea: number;
  hasCourtage: 'YES' | 'NO' | 'NOT_APPLICABLE';
  courtage?: string;
  courtageNote?: string;
  creationDate?: string;
  lastModificationDate?: string;

  // spezfische Felder gleich wie Wohnungen
  searchField1?: string;
  searchField2?: string;
  searchField3?: string;
  groupNumber?: number;
  showAddress: boolean;
  furnishingNote?: string;
  locationNote?: string;
  otherNote?: string;
  contactId?: string;
  cellar?: 'YES' | 'NOT_APPLICABLE';
  handicappedAccessible?: 'YES' | 'NOT_APPLICABLE';
  numberOfParkingSpaces?: string;
  condition?:
    | 'NO_INFORMATION'
    | 'FIRST_TIME_USE'
    | 'FIRST_TIME_USE_AFTER_REFURBISHMENT'
    | 'MINT_CONDITION'
    | 'REFURBISHED'
    | 'MODERNIZED'
    | 'FULLY_RENOVATED'
    | 'WELL_KEPT'
    | 'NEED_OF_RENOVATION'
    | 'NEGOTIABLE'
    | 'RIPE_FOR_DEMOLITION';
  constructionYear?: number;
  constructionYearUnknown?: boolean;
  lastRefurbishment?: string;
  interiorQuality?:
    | 'NO_INFORMATION'
    | 'LUXURY'
    | 'SOPHISTICATED'
    | 'NORMAL'
    | 'SIMPLE';
  freeFrom?: string;
  heatingType?: string;
  firingType?: string;
  buildingEnergyRatingType?:
    | 'NO_INFORMATION'
    | 'ENERGY_REQUIRED'
    | 'ENERGY_CONSUMPTION';
  thermalCharacteristic?: number;
  energyConsumptionContainsWarmWater?: 'YES' | 'NOT_APPLICABLE';
  numberOfFloors?: number;
  usableFloorSpace?: number;
  numberOfBedRooms?: number;
  numberOfBathRooms?: number;
  guestToilet?: 'YES' | 'NOT_APPLICABLE';
  parkingSpaceType?: string;
  rented?: 'YES' | 'NOT_APPLICABLE';
  rentalIncome?: number;
  listed?: 'YES' | 'NOT_APPLICABLE';
  parkingSpacePrice?: number;
  summerResidencePractical?: 'YES' | 'NOT_APPLICABLE';
  tenancy?: number;
  leaseholdInterest?: number;
  currency: 'EUR';
  latitude?: number;
  longitude?: number;
  latitudeWithNo?: number;
  longitudeWithNo?: number;
  priceIntervalType: 'ONE_TIME_CHARGE';
  energyPerformanceCertificate?: boolean;
  builtInKitchen?: boolean;
  
  // weiter für Haus spezifische Felder
  lodgerFlat?: 'YES' | 'NOT_APPLICABLE'; // Mit Einliegerwohnung
  constructionPhase?:
    | 'PROJECTED'
    | 'UNDER_CONSTRUCTION'
    | 'COMPLETED'
    | 'NO_INFORMATION';
  buildingType:
    | 'NO_INFORMATION'
    | 'SINGLE_FAMILY_HOUSE'
    | 'MID_TERRACE_HOUSE'
    | 'END_TERRACE_HOUSE'
    | 'MULTI_FAMILY_HOUSE'
    | 'BUNGALOW'
    | 'FARMHOUSE'
    | 'SEMIDETACHED_HOUSE'
    | 'VILLA'
    | 'CASTLE_MANOR_HOUSE'
    | 'SPECIAL_REAL_ESTATE'
    | 'OTHER'; // Haustyp

  // aussortiert bei Haus, da nur Wohnung betreffen
  // apartmentType?: "ROOF_STOREY" | "LOFT" | "MAISONETTE" | "PENTHOUSE" | "TERRACED_FLAT" | "GROUND_FLOOR" | "APARTMENT" | "RAISED_GROUND_FLOOR" | "HALF_BASEMENT" | "OTHER" | "NO_INFORMATION";
  // floor?: number;
  // lift?: boolean;
  //   balcony?: boolean;
  //   garden?: boolean;
  // serviceCharge?: number;
}

export interface GrundstueckDetails {
  externalId?: string;
  marketingType: 'PURCHASE';
  title: string;
  street: string;
  houseNumber: string;
  postcode: string;
  city: string;
  descriptionNote?: string;
  value: number; // Kaufpreis
  livingSpace: number;
  numberOfRooms: number;
  plotArea: number;
  hasCourtage: 'YES' | 'NO' | 'NOT_APPLICABLE';
  courtage?: string;
  courtageNote?: string;
  creationDate?: string;
  lastModificationDate?: string;

  // spezfische Felder gleich wie Wohnungen und Häuser
  searchField1?: string;
  searchField2?: string;
  searchField3?: string;
  groupNumber?: number;
  locationNote?: string;
  otherNote?: string;
  showAddress: boolean;
  contactId?: string;
  tenancy?: number;
  currency: 'EUR';
  freeFrom?: string;
  latitude?: number;
  longitude?: number;
  latitudeWithNo?: number;
  longitudeWithNo?: number;
  priceIntervalType: 'ONE_TIME_CHARGE';

  // zus. bei Grundstücke
  commercializationType: 'BUY' | 'LEASEHOLD';
  recommendedUseTypes?:
    | 'NO_INFORMATION'
    | 'FUTURE_DEVELOPMENT_LAND'
    | 'TWINHOUSE'
    | 'SINGLE_FAMILY_HOUSE'
    | 'GARAGE'
    | 'GARDEN'
    | 'NO_DEVELOPMENT'
    | 'APARTMENT_BUILDING'
    | 'ORCHARD'
    | 'TERRACE_HOUSE'
    | 'PARKING_SPACE'
    | 'VILLA'
    | 'FORREST';
  minDivisible?: number;
  shortTermConstructible?: boolean;
  buildingPermission?: boolean;
  demolition?: boolean;
  siteDevelopmentType?:
    | 'DEVELOPED'
    | 'DEVELOPED_PARTIALLY'
    | 'NOT_DEVELOPED'
    | 'NO_INFORMATION';
  siteConstructibleType?:
    | 'CONSTRUCTION_PLAN'
    | 'NEIGHBOUR_CONSTRUCTION'
    | 'EXTERNALAREA'
    | 'NO_INFORMATION';
  grz?: number;
  gfz?: number;

  // aussortiert bei Haus, da nur Wohnung betreffen

  // apartmentType?: "ROOF_STOREY" | "LOFT" | "MAISONETTE" | "PENTHOUSE" | "TERRACED_FLAT" | "GROUND_FLOOR" | "APARTMENT" | "RAISED_GROUND_FLOOR" | "HALF_BASEMENT" | "OTHER" | "NO_INFORMATION";
  // floor?: number;
  // lift?: boolean;
  // builtInKitchen?: boolean;
  // balcony?: boolean;
  // garden?: boolean;
  // serviceCharge?: number;
  // furnishingNote?: string;
  // cellar?: "YES" | "NOT_APPLICABLE";
  // handicappedAccessible?: "YES" | "NOT_APPLICABLE";
  // numberOfParkingSpaces?: string;
  // condition?: "NO_INFORMATION" | "FIRST_TIME_USE" | "FIRST_TIME_USE_AFTER_REFURBISHMENT" | "MINT_CONDITION" | "REFURBISHED" | "MODERNIZED" | "FULLY_RENOVATED" | "WELL_KEPT" | "NEED_OF_RENOVATION" | "NEGOTIABLE" | "RIPE_FOR_DEMOLITION";
  // constructionYear?: number;
  // constructionYearUnknown?: boolean;
  // lastRefurbishment?: string;
  // interiorQuality?: "NO_INFORMATION" | "LUXURY" | "SOPHISTICATED" | "NORMAL" | "SIMPLE";
  // heatingType?: string;
  // firingType?: string;
  // buildingEnergyRatingType?: "NO_INFORMATION" | "ENERGY_REQUIRED" | "ENERGY_CONSUMPTION";
  // thermalCharacteristic?: number;
  // energyConsumptionContainsWarmWater?: "YES" | "NOT_APPLICABLE";
  // numberOfFloors?: number;
  // usableFloorSpace?: number;
  // numberOfBedRooms?: number;
  // numberOfBathRooms?: number;
  // guestToilet?: "YES" | "NOT_APPLICABLE";
  // parkingSpaceType?: string;
  // rented?: "YES" | "NOT_APPLICABLE";
  // rentalIncome?: number;
  // listed?: "YES" | "NOT_APPLICABLE";
  // parkingSpacePrice?: number;
  // summerResidencePractical?: "YES" | "NOT_APPLICABLE";
  // leaseholdInterest?: number;
  // energyPerformanceCertificate?: boolean;
  // lodgerFlat?: "YES" | "NOT_APPLICABLE"; // Mit Einliegerwohnung
  // constructionPhase?: "PROJECTED" | "UNDER_CONSTRUCTION" | "COMPLETED" | "NO_INFORMATION"; // Bauphase
  // buildingType: "NO_INFORMATION" | "SINGLE_FAMILY_HOUSE" | "MID_TERRACE_HOUSE" | "END_TERRACE_HOUSE" | "MULTI_FAMILY_HOUSE" | "BUNGALOW" | "FARMHOUSE" | "SEMIDETACHED_HOUSE" | "VILLA" | "CASTLE_MANOR_HOUSE" | "SPECIAL_REAL_ESTATE" | "OTHER"; // Haustyp
}
