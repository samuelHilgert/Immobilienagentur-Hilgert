import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [AuthService], 
  templateUrl: './dashboard-login.component.html',
  styleUrls: ['./dashboard-login.component.scss'],
})

export class DashboardLoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: [''],  
      password: [''],
    });
  }

  async onLogin(): Promise<void> {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      const result = await this.authService.login(email, password);
      if (result.success) {
        this.router.navigateByUrl('/dashboard');
      } else {
        console.log('Error object:', result.error); // Hier den Fehler ausgeben
        this.errorMessage = this.getErrorMessage(result.error);
      }
    } else {
      this.errorMessage = 'Bitte alle Felder ausfüllen!';
    }
  }

  private getErrorMessage(error: any): string {
    switch(error?.code) {
      case 'auth/user-not-found':
        return 'Benutzer nicht gefunden';
      case 'auth/wrong-password':
        return 'Falsches Passwort';
      case 'auth/invalid-email':
        return 'Ungültige E-Mail-Adresse';
      default:
        return 'Ein Fehler ist aufgetreten: ' + (error?.message || error);
    }
  }
}