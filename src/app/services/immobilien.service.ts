import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, throwError } from 'rxjs';
import { Immobilie, WohnungDetails, HausDetails, GrundstueckDetails } from '../models/immobilie.model';

@Injectable({
  providedIn: 'root',
})
export class ImmobilienService {
  private baseUrl = 'https://immo.samuelhilgert.com/backend/api';

  constructor(private http: HttpClient) {}

  // ✅ Immobilie abrufen (UNVERÄNDERT)
  getImmobilien(): Observable<{ immobilien: Immobilie[] }> {
    return this.http.get<{ immobilien: Immobilie[] }>(
      `${this.baseUrl}/immobilien_api.php`
    );
  }

  // ✅ Immobilie anlegen (wird für ALLE Immobilientypen zuerst ausgeführt)
  addImmobilie(immobilie: Immobilie): Observable<{ message: string; immobilie: Immobilie }> {
    return this.http.post<{ message: string; immobilie: Immobilie }>(
      `${this.baseUrl}/add_immobilie.php`,
      immobilie
    );
  }

  // ✅ Haus speichern: Erst Immobilie, dann Details
  addHaus(hausDetails: HausDetails): Observable<{ message: string; haus: HausDetails }> {
    return this.addImmobilie(hausDetails).pipe(
      switchMap(response => {
        if (!response.immobilie.externalId) {
          return throwError(() => new Error("Fehler beim Erstellen der Immobilie"));
        }

        // `externalId` der Immobilie in `hausDetails` setzen
        const hausData = { ...hausDetails, externalId: response.immobilie.externalId };

        return this.http.post<{ message: string; haus: HausDetails }>(
          `${this.baseUrl}/add_haus.php`,
          hausData
        );
      })
    );
  }

  // ✅ Wohnung speichern: Erst Immobilie, dann Details
  addWohnung(wohnungDetails: WohnungDetails): Observable<{ message: string; wohnung: WohnungDetails }> {
    return this.addImmobilie(wohnungDetails).pipe(
      switchMap(response => {
        if (!response.immobilie.externalId) {
          return throwError(() => new Error("Fehler beim Erstellen der Immobilie"));
        }

        // `externalId` der Immobilie in `wohnungDetails` setzen
        const wohnungData = { ...wohnungDetails, externalId: response.immobilie.externalId };

        return this.http.post<{ message: string; wohnung: WohnungDetails }>(
          `${this.baseUrl}/add_wohnung.php`,
          wohnungData
        );
      })
    );
  }

  // ✅ Grundstück speichern: Erst Immobilie, dann Details
  addGrundstueck(grundstueckDetails: GrundstueckDetails): Observable<{ message: string; grundstueck: GrundstueckDetails }> {
    return this.addImmobilie(grundstueckDetails).pipe(
      switchMap(response => {
        if (!response.immobilie.externalId) {
          return throwError(() => new Error("Fehler beim Erstellen der Immobilie"));
        }

        // `externalId` der Immobilie in `grundstueckDetails` setzen
        const grundstueckData = { ...grundstueckDetails, externalId: response.immobilie.externalId };

        return this.http.post<{ message: string; grundstueck: GrundstueckDetails }>(
          `${this.baseUrl}/add_grundstueck.php`,
          grundstueckData
        );
      })
    );
  }
}
