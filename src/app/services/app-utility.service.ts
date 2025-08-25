import { Injectable, isDevMode } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AppUtilityService {
  // ---------- Umgebung & Host ----------
  isLocalhost(host = location.hostname): boolean {
    return host === 'localhost' || host === '127.0.0.1' || host === '::1';
  }

  isDev(): boolean {
    // funktioniert auch ohne Angular environments
    return isDevMode() || this.isLocalhost();
  }

  // ---------- Confirm / Alerts ----------
  /**
   * Zeigt eine Bestätigungsfrage *nur* auf localhost.
   * Außerhalb von localhost => true (keine Nachfrage).
   * Hinweis: Für "Alert mit Frage" ist window.confirm das passende API.
   */
  async confirmIfLocalhost(message = 'Aktion vom lokalen Server ausführen?'): Promise<boolean> {
    if (!this.isLocalhost()) return true;
    return window.confirm(message);
  }

  /**
   * Universelle Bestätigungsfrage (unabhängig vom Host).
   * Nützlich, wenn du auch in Prod gelegentlich abfragen willst.
   */
  async confirm(message = 'Möchten Sie fortfahren?'): Promise<boolean> {
    return window.confirm(message);
  }

  // ---------- Formatierungen ----------
  toEuro(amount: number | null | undefined, withCurrency = true): string {
    const n = typeof amount === 'number' ? amount : 0;
    return new Intl.NumberFormat('de-DE', {
      style: withCurrency ? 'currency' : 'decimal',
      currency: 'EUR',
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(n);
  }

  formatDateTimeDE(d: Date | string | number | null | undefined): string {
    if (!d) return '';
    const dt = d instanceof Date ? d : new Date(d);
    return `${dt.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })} ${dt.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`;
    // Beispiel: "Montag, 25.08.2025 14:30"
  }

  // ---------- URLs & Strings ----------
  ensureHttps(url: string): string {
    if (!url) return url;
    if (/^https?:\/\//i.test(url)) return url;
    return `https://${url}`;
  }

  buildViewingConfirmUrl(vcId: string, base = location.origin): string {
    return `${base}/viewing-confirmation/${vcId}`;
  }

  // ---------- kleine Math-Helfer ----------
  clamp(n: number, min: number, max: number): number {
    return Math.min(Math.max(n, min), max);
  }
}
