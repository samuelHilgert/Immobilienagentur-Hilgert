// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  user,
  authState,
  User
} from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface AuthResponse {
  success: boolean;
  user?: User;
  error?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User | null>;
  authState$: Observable<User | null>;
  isLoggedIn$: Observable<boolean>;

  constructor(private auth: Auth) {
    this.user$ = user(this.auth);
    this.authState$ = authState(this.auth);
    this.isLoggedIn$ = this.authState$.pipe(map(user => !!user));
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error };
    }
  }

  async register(email: string, password: string): Promise<AuthResponse> {
    try {
      const result = await createUserWithEmailAndPassword(this.auth, email, password);
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error };
    }
  }

  async logout(): Promise<void> {
    return signOut(this.auth);
  }

  isAdmin(): Observable<boolean> {
    return this.user$.pipe(
      map(user => {
        // Optional: Hier kannst du zusätzliche Rollen-Logik implementieren
        // z.B. mit Custom Claims oder durch Abfragen eines Firestore-Dokuments
        return !!user; // Aktuell bedeutet eingeloggt = Admin
      })
    );
  }
}