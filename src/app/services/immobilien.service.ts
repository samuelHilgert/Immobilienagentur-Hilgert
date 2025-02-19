import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Immobilie } from '../models/immobilie.model'; // Dein Interface für die Immobilien-Daten

@Injectable({
  providedIn: 'root'
})
export class ImmobilienService {
  private apiUrl = 'https://immo.samuelhilgert.com/backend/api'; // ✅ Richtiger API-Pfad

  constructor(private http: HttpClient) {}

  // ✅ GET-Methode mit korrektem Rückgabetyp
  getImmobilien(): Observable<{ immobilien: Immobilie[] }> {
    return this.http.get<{ immobilien: Immobilie[] }>(`${this.apiUrl}/immobilien_api.php`);
  }

  // ✅ POST-Methode mit korrektem Typ
  addImmobilie(immobilie: Immobilie): Observable<{ message: string; immobilie: Immobilie }> {
    return this.http.post<{ message: string; immobilie: Immobilie }>(`${this.apiUrl}/add_immobilie.php`, immobilie);
  }
}
