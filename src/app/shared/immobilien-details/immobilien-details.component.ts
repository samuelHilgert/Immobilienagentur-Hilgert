import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { GrundstueckDetails, HausDetails, Immobilie, WohnungDetails } from '../../models/immobilie.model';
import { MATERIAL_MODULES } from '../material-imports';
import { MediaAttachment } from '../../models/media.model';
import { ImmobilienService } from '../../services/immobilien.service';
import { EnergieklasseDiagrammComponent } from '../energieklasse-diagramm/energieklasse-diagramm.component';

@Component({
  selector: 'app-immobilien-details',
  standalone: true,
  imports: [CommonModule, MATERIAL_MODULES, EnergieklasseDiagrammComponent],
  templateUrl: './immobilien-details.component.html',
  styleUrl: './immobilien-details.component.scss',
})
export class ImmobilienDetailsComponent {
  immobilie: Immobilie;
  media: MediaAttachment[];
  wohnungDetails: WohnungDetails | null = null;
  hausDetails: HausDetails | null = null;
  grundstueckDetails: GrundstueckDetails | null = null;

  // Labels für Wohnungen
  apartmentTypeLabels: { [key: string]: string } = {
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
    NO_INFORMATION: 'Keine Angabe'
  };

  // Labels für Häuser

  buildingTypeLabels: { [key: string]: string } = {
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
    OTHER: 'Sonstige'
  };
  Yes_No_Labels: { [key: string]: string } = {
    YES: 'Ja',
    NOT_APPLICABLE: 'Nein'
  };
  True_False_Labels: { [key: string]: string } = {
    true: 'Ja',
    false: 'Nein'
  };
  
  
  
  conditionLabels: { [key: string]: string } = {
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
    RIPE_FOR_DEMOLITION: 'Abrissobjekt'
  };
  constructionPhaseLabels: { [key: string]: string } = {
    PROJECTED: 'Haus in Planung',
    UNDER_CONSTRUCTION: 'Haus im Bau',
    COMPLETED: 'Haus fertig gestellt',
    NO_INFORMATION: 'Keine Angabe'
  };
  interiorQualityLabels: { [key: string]: string } = {
    NO_INFORMATION: 'Keine Angabe',
    LUXURY: 'Luxusausstattung',
    SOPHISTICATED: 'Gehoben',
    NORMAL: 'Normal',
    SIMPLE: 'Einfach'
  };
  heatingTypeLabels: { [key: string]: string } = {
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
    HEAT_PUMP: 'Wärmepumpe'
  };
  firingTypeLabels: { [key: string]: string } = {
    NO_INFORMATION: 'Keine Angabe',
    GEOTHERMAL: 'Erdwärme',
    SOLAR_HEATING: 'Solarheizung',
    PELLET_HEATING: 'Pelletheizung',
    GAS: 'Gas',
    OIL: 'Öl',
    ELECTRICITY: 'Strom',
    COAL: 'Kohle'
  };
  parkingSpaceTypeLabels: { [key: string]: string } = {
    NO_INFORMATION: 'Keine Angabe',
    GARAGE: 'Garage',
    OUTSIDE: 'Außenstellplatz',
    CARPORT: 'Carport',
    DUPLEX: 'Duplex',
    CAR_PARK: 'Parkhaus',
    UNDERGROUND_GARAGE: 'Tiefgarage'
  };
  buildingEnergyRatingTypeLabels: { [key: string]: string } = {
    NO_INFORMATION: 'Keine Angabe',
    ENERGY_REQUIRED: 'Energiebedarfsausweis',
    ENERGY_CONSUMPTION: 'Energieverbrauchsausweis',
  };


  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { immobilie: Immobilie; media: MediaAttachment[] },
    private dialogRef: MatDialogRef<ImmobilienDetailsComponent>,
    private immobilienService: ImmobilienService // 👈 hier
  ) {
    this.immobilie = data.immobilie;
    this.media = data.media;

    this.loadDetails(); // 👈 Details nachladen
  }

  async loadDetails(): Promise<void> {
    const id = this.immobilie.externalId;
    const type = this.immobilie.propertyType;
  
    if (!id) return;
  
    try {
      const fullData = await this.immobilienService.getProperty(id);
      
      if (type === 'Wohnung') {
        this.wohnungDetails = fullData.apartmentDetails;
      } else if (type === 'Haus') {
        this.hausDetails = fullData.houseDetails;
      } else if (type === 'Grundstück') {
        this.grundstueckDetails = fullData.landDetails;
      }
    } catch (error) {
      console.error('Fehler beim Laden der Detaildaten:', error);
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  get wohnung() {
    return (this.immobilie as any).apartmentDetails ?? null;
  }
  get haus() {
    return (this.immobilie as any).houseDetails ?? null;
  }
  get grundstueck() {
    return (this.immobilie as any).landDetails ?? null;
  }

}
