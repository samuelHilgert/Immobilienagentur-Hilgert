import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, catchError, of } from 'rxjs';
import { Immobilie, WohnungDetails } from '../models/immobilie.model';

// Interface für die Media-Daten
interface MediaAttachment {
  id: number;
  externalId: string;
  type: 'image' | 'video';
  url: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})

export class ImmobilienService {
  private baseUrl = 'https://immo.samuelhilgert.com/backend/api';

  constructor(private http: HttpClient) {}

  getImmobilien(): Observable<{ immobilien: Immobilie[] }> {
    return this.http.get<{ immobilien: Immobilie[] }>(`${this.baseUrl}/immobilien_api.php`);
  }


    // Neue Funktion zum Abrufen aller Medien einer Immobilie
    getMediaByExternalId(externalId: string): Observable<MediaAttachment[]> {
      return this.http.get<MediaAttachment[]>(`${this.baseUrl}/get_media.php?externalId=${externalId}`)
        .pipe(
          catchError(error => {
            console.error('Error fetching media:', error);
            return of([]);
          })
        );
    }

  addWohnung(wohnungDetails: WohnungDetails): Observable<any> {
    // Ensure required fields are present
    const immobilienData: Immobilie = {
      externalId: wohnungDetails.externalId ||  Date.now().toString().substring(8),
      title: wohnungDetails.title,
      street: wohnungDetails.street,
      houseNumber: wohnungDetails.houseNumber,
      postcode: wohnungDetails.postcode,
      city: wohnungDetails.city,
      descriptionNote: wohnungDetails.descriptionNote,
      value: wohnungDetails.value,
      hasCourtage: wohnungDetails.hasCourtage,
      courtage: wohnungDetails.courtage,
      courtageNote: wohnungDetails.courtageNote,
      livingSpace: wohnungDetails.livingSpace,
      plotArea: 0,
      numberOfRooms: wohnungDetails.numberOfRooms,
      marketingType: 'PURCHASE',
      creationDate: new Date().toISOString(),
      lastModificationDate: new Date().toISOString()
    };

    // First save to immobilien table
    return this.http.post(`${this.baseUrl}/add_immobilie.php`, immobilienData)
      .pipe(
        switchMap(() => {
          // Ensure wohnungDetails has the same externalId and dates
          wohnungDetails.externalId = immobilienData.externalId;
          wohnungDetails.creationDate = immobilienData.creationDate;
          wohnungDetails.lastModificationDate = immobilienData.lastModificationDate;
          
          // Then save to wohnung_details
          return this.http.post(`${this.baseUrl}/add_wohnung.php`, wohnungDetails);
        }),
        catchError(error => {
          console.error('Error saving property:', error);
          return of({ error: error.message || 'Error saving property' });
        })
      );
  }

  uploadMedia(formData: FormData, externalId: string): Observable<any> {
    // Ensure externalId is added to FormData
    formData.append('externalId', externalId);
    
    return this.http.post(`${this.baseUrl}/upload_media.php`, formData)
      .pipe(
        catchError(error => {
          console.error('Error uploading media:', error);
          return of({ error: error.message || 'Error uploading media' });
        })
      );
  }
}