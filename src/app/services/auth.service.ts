import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://immo.samuelhilgert.com/backend/auth';

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: { username: string, password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/dashboard_login.php`, credentials);
  }  

  logout(): void {
    this.http.get<any>(`${this.apiUrl}/dashboard_logout.php`).subscribe(() => {
      localStorage.removeItem('admin');
      this.router.navigate(['/login']);
    });
  }  

  isLoggedIn(): boolean {
    return localStorage.getItem('admin') === 'true';
  }
}
