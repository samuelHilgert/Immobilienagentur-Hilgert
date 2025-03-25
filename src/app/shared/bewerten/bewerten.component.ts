import { Component } from '@angular/core';
import { MATERIAL_MODULES } from '../material-imports';
import { Bewertung } from '../../models/bewertung.model';
import { BewertungenService } from '../../services/bewertungen.service';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bewerten',
  standalone: true,
  imports: [MATERIAL_MODULES, NgIf, FormsModule],
  templateUrl: './bewerten.component.html',
  styleUrl: './bewerten.component.scss'
})

export class BewertenComponent {
  bewertung: Bewertung = {
    bewertungId: '',
    quelle: {
      google: false,
      homepage: false,
      immoScout: false
    },
    text: '',
    rating: 5,
    autorName: '',
    autorEmail: '',
    creationDate: new Date()
  };
  hoverRating = 0;

  successMessage = '';
  errorMessage = '';

  constructor(private bewertungenService: BewertungenService) {}

  async submitBewertung(): Promise<void> {
    this.successMessage = '';
    this.errorMessage = '';

    try {
      const result = await this.bewertungenService.saveBewertung(this.bewertung);
      if (result.success) {
        this.successMessage = 'Vielen Dank für Ihre Bewertung!';
        this.bewertung = {
          bewertungId: '',
          quelle: { google: false, homepage: false, immoScout: false },
          text: '',
          rating: 5,
          autorName: '',
          autorEmail: '',
          creationDate: new Date()
        };
      } else {
        this.errorMessage = 'Fehler beim Speichern.';
      }
    } catch (error) {
      console.error('Fehler:', error);
      this.errorMessage = 'Ein Fehler ist aufgetreten.';
    }
  }

  setRating(star: number) {
    this.bewertung.rating = star;
  }

}
