import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://immo.samuelhilgert.com';

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: { username: string, password: string }) {
    return this.http.post<any>(`${this.apiUrl}/dashboard_login.php`, credentials);
  }

  logout(): void {
    this.http.get<any>(`${this.apiUrl}/dashboard_logout.php`).subscribe(() => {
      localStorage.removeItem('admin'); // Login-Status entfernen
      this.router.navigate(['/login']); // Weiterleitung zur Login-Seite
    });
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('admin') === 'true';
  }
}
