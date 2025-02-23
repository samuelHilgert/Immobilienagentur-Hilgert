// ✅ NEUES INTERFACE für Immobilie
export interface Immobilie {
  externalId?: string;
  title: string;
  street: string;
  houseNumber: string;
  postcode: string;
  city: string;
  descriptionNote?: string;
  locationNote?: string;
  otherNote?: string;
  value: number; // Kaufpreis
  hasCourtage: "YES" | "NO" | "NOT_APPLICABLE";
  courtage?: string;
  courtageNote?: string;
  creationDate?: string;
  lastModificationDate?: string;
  marketingType: "Kauf";
}

// ✅ NEUES INTERFACE für Wohnungen
export interface WohnungDetails {
  externalId?: string;
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
  apartmentType?: "ROOF_STOREY" | "LOFT" | "MAISONETTE" | "PENTHOUSE" | "TERRACED_FLAT" | "GROUND_FLOOR" | "APARTMENT" | "RAISED_GROUND_FLOOR" | "HALF_BASEMENT" | "OTHER" | "NO_INFORMATION";
  floor?: number;
  lift?: boolean;
  cellar?: "YES" | "NOT_APPLICABLE";
  handicappedAccessible?: "YES" | "NOT_APPLICABLE";
  numberOfParkingSpaces?: string;
  condition?: "NO_INFORMATION" | "FIRST_TIME_USE" | "FIRST_TIME_USE_AFTER_REFURBISHMENT" | "MINT_CONDITION" | "REFURBISHED" | "MODERNIZED" | "FULLY_RENOVATED" | "WELL_KEPT" | "NEED_OF_RENOVATION" | "NEGOTIABLE" | "RIPE_FOR_DEMOLITION";
  constructionYear?: number;
  constructionYearUnknown?: boolean;
  lastRefurbishment?: string;
  interiorQuality?: "NO_INFORMATION" | "LUXURY" | "SOPHISTICATED" | "NORMAL" | "SIMPLE";
  freeFrom?: string;
  heatingType?: string;
  firingType?: string;
  buildingEnergyRatingType?: "NO_INFORMATION" | "ENERGY_REQUIRED" | "ENERGY_CONSUMPTION";
  thermalCharacteristic?: number;
  energyConsumptionContainsWarmWater?: "YES" | "NOT_APPLICABLE";
  numberOfFloors?: number;
  usableFloorSpace?: number;
  numberOfBedRooms?: number;
  numberOfBathRooms?: number;
  guestToilet?: "YES" | "NOT_APPLICABLE";
  parkingSpaceType?: string;
  rented?: "YES" | "NOT_APPLICABLE";
  rentalIncome?: number;
  listed?: "YES" | "NOT_APPLICABLE";
  parkingSpacePrice?: number;
  summerResidencePractical?: "YES" | "NOT_APPLICABLE";
  tenancy?: number;
  leaseholdInterest?: number;
  value: number;
  currency: "EUR";
  livingSpace: number;
  numberOfRooms: number;
  builtInKitchen?: boolean;
  balcony?: boolean;
  garden?: boolean;
  hasCourtage: "YES" | "NO" | "NOT_APPLICABLE";
  courtage?: string;
  courtageNote?: string;
  latitude?: number;
  longitude?: number;
  creationDate?: string;
  lastModificationDate?: string;
  marketingType: "Kauf";
  priceIntervalType: "ONE_TIME_CHARGE";
  energyPerformanceCertificate?: boolean;
  serviceCharge?: number;
}


// ✅ NEUES INTERFACE für Häuser
 export interface HausDetails {
    externalId?: string; // Max. 50 Zeichen, erlaubt: "/" und "\"
    title: string; // Max. 100 Zeichen
    street: string; // Max. 100 Zeichen
    houseNumber: string; // Max. 10 Zeichen
    postcode: string; // Max. 5 Zeichen
    city: string; // Max. 50 Zeichen
    searchField1?: string;
    searchField2?: string;
    searchField3?: string;
    groupNumber?: number; // Max. 10-stellig (0 - 2147483647)
    descriptionNote?: string; // Max. 3999 Bytes
    furnishingNote?: string; // Max. 3999 Bytes
    locationNote?: string; // Max. 3999 Bytes
    otherNote?: string; // Max. 3999 Bytes
    showAddress: boolean;
    contactId?: string;
    lodgerFlat?: "YES" | "NOT_APPLICABLE";
    constructionPhase?: "PROJECTED" | "UNDER_CONSTRUCTION" | "COMPLETED" | "NO_INFORMATION";
    buildingType: "NO_INFORMATION" | "SINGLE_FAMILY_HOUSE" | "MID_TERRACE_HOUSE" | "END_TERRACE_HOUSE" | "MULTI_FAMILY_HOUSE" | "BUNGALOW" | "FARMHOUSE" | "SEMIDETACHED_HOUSE" | "VILLA" | "CASTLE_MANOR_HOUSE" | "SPECIAL_REAL_ESTATE" | "OTHER";
    cellar?: "YES" | "NOT_APPLICABLE";
    handicappedAccessible?: "YES" | "NOT_APPLICABLE";
    numberOfParkingSpaces?: string;
    condition?: "NO_INFORMATION" | "FIRST_TIME_USE" | "FIRST_TIME_USE_AFTER_REFURBISHMENT" | "MINT_CONDITION" | "REFURBISHED" | "MODERNIZED" | "FULLY_RENOVATED" | "WELL_KEPT" | "NEED_OF_RENOVATION" | "NEGOTIABLE" | "RIPE_FOR_DEMOLITION";
    constructionYear?: number;
    constructionYearUnknown?: boolean;
    lastRefurbishment?: string;
    interiorQuality?: "NO_INFORMANTION" | "LUXURY" | "SOPHISTICATED" | "NORMAL" | "SIMPLE";
    freeFrom?: string;
    heatingType?: "NO_INFORMATION" | "SELF_CONTAINED_CENTRAL_HEATING" | "STOVE_HEATING" | "CENTRAL_HEATING" | "COMBINED_HEAT_AND_POWER_PLANT" | "ELECTRIC_HEATING" | "DISTRICT_HEATING" | "FLOOR_HEATING" | "GAS_HEATING" | "WOOD_PELLET_HEATING" | "NIGHT_STORAGE_HEATER" | "OIL_HEATING" | "SOLAR_HEATING" | "HEAT_PUMP";
    firingType?: "NO_INFORMANTION" | "GEOTHERMAL" | "SOLAR_HEATING" | "PELLET_HEATING" | "GAS" | "OIL" | "DISTRICT_HEATING" | "ELECTRICITY" | "COAL";
    buildingEnergyRatingType?: "NO_INFORMATION" | "ENERGY_REQUIRED" | "ENERGY_CONSUMPTION";
    thermalCharacteristic?: number;
    energyConsumptionContainsWarmWater?: "YES" | "NOT_APPLICABLE";
    numberOfFloors?: number;
    usableFloorSpace?: number;
    numberOfBedRooms?: number;
    numberOfBathRooms?: number;
    guestToilet?: "YES" | "NOT_APPLICABLE";
    parkingSpaceType?: "NO_INFORMATION" | "GARAGE" | "OUTSIDE" | "CARPORT" | "DUPLEX" | "CAR_PARK" | "UNDERGROUND_GARAGE";
    rented?: "YES" | "NOT_APPLICABLE";
    rentalIncome?: number;
    listed?: "YES" | "NOT_APPLICABLE";
    parkingSpacePrice?: number;
    summerResidencePractical?: "YES" | "NOT_APPLICABLE";
    tenancy?: number;
    leaseholdInterest?: number;
    value: number;
    currency: "EUR";
    livingSpace: number;
    plotArea: number;
    numberOfRooms: number;
    hasCourtage: "YES" | "NO" | "NOT_APPLICABLE";
    courtage?: string;
    courtageNote?: string;
    latitude?: number; // min. -90.0, max. 90.0
    longitude?: number; // min. -180.0, max. 180.0
    creationDate?: string;
    lastModificationDate?: string;
    marketingType: "Kauf";
    priceIntervalType: "ONE_TIME_CHARGE";
    energyPerformanceCertificate?: boolean;
  }
  

// ✅ NEUES INTERFACE für Grundstücke
  export interface GrundstueckDetails {
    externalId?: string;
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
    locationNote?: string;
    otherNote?: string;
    showAddress: boolean;
    contactId?: string;
    commercializationType: "BUY" | "LEASEHOLD";
    recommendedUseTypes?: "NO_INFORMATION" | "FUTURE_DEVELOPMENT_LAND" | "TWINHOUSE" | "SINGLE_FAMILY_HOUSE" | "GARAGE" | "GARDEN" | "NO_DEVELOPMENT" | "APARTMENT_BUILDING" | "ORCHARD" | "TERRACE_HOUSE" | "PARKING_SPACE" | "VILLA" | "FORREST";
    tenancy?: number;
    value: number;
    currency: "EUR";
    plotArea: number;
    minDivisible?: number;
    hasCourtage: "YES" | "NO" | "NOT_APPLICABLE";
    courtage?: string;
    courtageNote?: string;
    freeFrom?: string;
    shortTermConstructible?: boolean;
    buildingPermission?: boolean;
    demolition?: boolean;
    siteDevelopmentType?: "DEVELOPED" | "DEVELOPED_PARTIALLY" | "NOT_DEVELOPED" | "NO_INFORMATION";
    siteConstructibleType?: "CONSTRUCTION_PLAN" | "NEIGHBOUR_CONSTRUCTION" | "EXTERNALAREA" | "NO_INFORMATION";
    grz?: number;
    gfz?: number;
    latitude?: number;
    longitude?: number;
    creationDate?: string;
    lastModificationDate?: string;
    marketingType: "Kauf";
    priceIntervalType: "ONE_TIME_CHARGE";
  }
  