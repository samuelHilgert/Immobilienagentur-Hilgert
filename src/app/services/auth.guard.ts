import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const isLoggedIn = localStorage.getItem('admin') === 'true'; // 🔐 Prüft, ob der Nutzer eingeloggt ist

    if (!isLoggedIn) {
      this.router.navigate(['/dashboard']); // ❌ Falls nicht eingeloggt, zurück zur Login-Seite
      return false;
    }
    return true;
  }
}
