import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HausDetails, Immobilie } from '../models/immobilie.model';

@Injectable({
  providedIn: 'root',
})
export class ImmobilienService {
  private baseUrl = 'https://immo.samuelhilgert.com/backend/api'; // ✅ Basis-URL korrigiert

  constructor(private http: HttpClient) {}

  // ✅ GET-Methode mit korrektem Rückgabetyp
  getImmobilien(): Observable<{ immobilien: Immobilie[] }> {
    return this.http.get<{ immobilien: Immobilie[] }>(
      `${this.baseUrl}/immobilien_api.php`
    );
  }

  // ✅ POST-Methode für das Speichern einer Immobilie
  addImmobilie(
    immobilie: Immobilie
  ): Observable<{ message: string; immobilie: Immobilie }> {
    return this.http.post<{ message: string; immobilie: Immobilie }>(
      `${this.baseUrl}/add_immobilie.php`,
      immobilie
    );
  }

  // ✅ POST-Methode für das Speichern eines Hauses in `haus_details`
  addHaus(hausDetails: HausDetails): Observable<{ message: string; haus: HausDetails }> {
    return this.http.post<{ message: string; haus: HausDetails }>(
      `${this.baseUrl}/add_haus.php`,
      hausDetails
    );
  }
}
