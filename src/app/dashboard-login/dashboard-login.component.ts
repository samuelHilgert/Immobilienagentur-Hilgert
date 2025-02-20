import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // FormsModule entfernt, da wir ReactiveFormsModule brauchen
  providers: [AuthService], // Da standalone, brauchen wir hier einen Provider für den Service
  templateUrl: './dashboard-login.component.html',
  styleUrls: ['./dashboard-login.component.scss']
})
export class DashboardLoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    public authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      username: [''],
      password: ['']
    });
  }

  onLogin(): void {
    console.log("🔍 Sende Login-Daten:", this.loginForm.value); // Debugging
  
    if (this.loginForm.valid) {
      this.http.post<any>(
        'https://immo.samuelhilgert.com/backend/auth/dashboard_login.php',
        this.loginForm.value,
        { headers: { 'Content-Type': 'application/json' } }
      ).subscribe(
        response => {
          console.log("🔍 API-Antwort:", response); // Debugging
          if (response && response.success) {
            localStorage.setItem('admin', 'true');
            this.router.navigate(['/dashboard/Hilgert-Immobilien']); // ✅ Automatisch zum Dashboard navigieren
          } else {
            this.errorMessage = response.message || '⚠ Falsche Anmeldedaten!';
          }
        },
        error => {
          console.error("❌ API Fehler:", error);
          this.errorMessage = '❌ Es gab ein Problem beim Login!';
        }
      );
    } else {
      this.errorMessage = '⚠ Bitte alle Felder ausfüllen!';
    }
  }  

  onLogout(): void {
    this.authService.logout();
  }
}
