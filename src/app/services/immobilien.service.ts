import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HausDetails, WohnungDetails, GrundstueckDetails, Immobilie } from '../models/immobilie.model';

@Injectable({
  providedIn: 'root',
})
export class ImmobilienService {
  private baseUrl = 'https://immo.samuelhilgert.com/backend/api';

  constructor(private http: HttpClient) {}

  getImmobilien(): Observable<{ immobilien: Immobilie[] }> {
    return this.http.get<{ immobilien: Immobilie[] }>(
      `${this.baseUrl}/immobilien_api.php`
    );
  }

  addImmobilie(
    immobilie: Immobilie
  ): Observable<{ message: string; immobilie: Immobilie }> {
    return this.http.post<{ message: string; immobilie: Immobilie }>(
      `${this.baseUrl}/add_immobilie.php`,
      immobilie
    );
  }

  addHaus(hausDetails: HausDetails): Observable<{ message: string; haus: HausDetails }> {
    return this.http.post<{ message: string; haus: HausDetails }>(
      `${this.baseUrl}/add_haus.php`,
      hausDetails
    );
  }

  // ✅ Methode für Wohnungen hinzufügen
  addWohnung(wohnungDetails: WohnungDetails): Observable<{ message: string; wohnung: WohnungDetails }> {
    return this.http.post<{ message: string; wohnung: WohnungDetails }>(
      `${this.baseUrl}/add_wohnung.php`,
      wohnungDetails
    );
  }

  // ✅ Methode für Grundstücke hinzufügen
  addGrundstueck(grundstueckDetails: GrundstueckDetails): Observable<{ message: string; grundstueck: GrundstueckDetails }> {
    return this.http.post<{ message: string; grundstueck: GrundstueckDetails }>(
      `${this.baseUrl}/add_grundstueck.php`,
      grundstueckDetails
    );
  }
}
