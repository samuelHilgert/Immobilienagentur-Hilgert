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
import { signInAnonymously } from 'firebase/auth';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

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
  isAdmin$: Observable<boolean>;

  // 👉 Hier deine Admin-UID eintragen (einmal zentral)
  private readonly ADMIN_UID = 'Y6GYrqJzGnRcmBDcGoYNliK1O9x1';

  constructor(private auth: Auth) {
    this.user$ = user(this.auth);
    this.authState$ = authState(this.auth);
    this.isLoggedIn$ = this.authState$.pipe(map(user => !!user));

    // 👮‍♂️ Admin-Prüfung: Vergleiche die UID
    this.isAdmin$ = this.user$.pipe(
      map(user => !!user && user.uid === this.ADMIN_UID)
    );

    // 🔐 Automatisch anonym einloggen, wenn niemand angemeldet ist
    this.authState$.subscribe(currentUser => {
      if (!currentUser) {
        signInAnonymously(this.auth)
          .then(() => console.log('✅ Anonym angemeldet'))
          .catch(err => console.error('❌ Anonyme Anmeldung fehlgeschlagen:', err));
      }
    });
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
    return this.isAdmin$;
  }
}
