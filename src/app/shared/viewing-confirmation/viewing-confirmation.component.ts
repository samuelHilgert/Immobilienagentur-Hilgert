import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MATERIAL_MODULES } from '../material-imports';
import { ViewingConfirmationService } from '../../services/viewing-confirmation.service';
import { ViewingConfirmation } from '../../models/viewing-confirmation.model';

@Component({
  selector: 'app-viewing-confirmation',
  standalone: true,
  imports: [CommonModule, MATERIAL_MODULES, RouterModule],
  templateUrl: './viewing-confirmation.component.html',
  styleUrl: './viewing-confirmation.component.scss',
})
export class ViewingConfirmationComponent implements OnInit {
  loading = true;
  error = '';
  saved = false;

  confirm!: ViewingConfirmation | null;

  acceptedGuidelines = false;
  note = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private svc: ViewingConfirmationService
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('viewingConfirmationId') || ''; // 👈
    if (!id.includes('_')) {
      this.error = 'Ungültiger Link.';
      this.loading = false;
      return;
    }

    try {
      this.confirm = await this.svc.get(id);
      if (!this.confirm || this.confirm.blocked) {
        this.router.navigate(['/expose-access-denied']);
        return;
      }
    } catch {
      this.error = 'Seite konnte nicht geladen werden.';
    } finally {
      this.loading = false;
    }
  }

  async onConfirm() {
    if (!this.confirm || !this.acceptedGuidelines) return;
    try {
      await this.svc.confirm(this.confirm.viewingConfirmationId, this.note);
      this.saved = true;

      // ⏳ Nach 3 Sekunden automatisch zur Startseite
      setTimeout(() => {
        this.router.navigate(['/startseite']);
      }, 3000);
    } catch {
      this.error = 'Bestätigung konnte nicht gespeichert werden.';
    }
  }
}
