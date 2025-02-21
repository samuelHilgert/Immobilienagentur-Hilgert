import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient, private router: Router) {}

  isAuthenticated(): Observable<boolean> {
    return this.http.get<{ authenticated: boolean }>('https://immo.samuelhilgert.com/backend/auth/auth_check.php')
      .pipe(
        map(response => {
          if (!response.authenticated) {
            this.router.navigate(['/dashboard-login']); // Falls nicht authentifiziert, zum Login umleiten
          }
          return response.authenticated;
        })
      );
  }

  logout(): void {
    localStorage.removeItem('admin'); // Optional: Falls du noch andere Daten speicherst
    this.http.get('https://immo.samuelhilgert.com/backend/auth/dashboard_logout.php')
      .subscribe(() => {
        this.router.navigate(['/dashboard-login']);
      });
  }
}
