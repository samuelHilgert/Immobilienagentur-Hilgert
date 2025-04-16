import { Component, Inject } from '@angular/core';
import { Immobilie } from '../../models/immobilie.model';
import { CommonModule } from '@angular/common';
import { MATERIAL_MODULES } from '../material-imports';
import {
  MAT_DIALOG_DATA,
  MatDialog,
} from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { WiderrufComponent } from '../../impressum/widerruf/widerruf.component';
import { AgbComponent } from '../../impressum/agb/agb.component';
import { DatenschutzComponent } from '../../impressum/datenschutz/datenschutz.component';
import { ExposeAnfrageService } from '../../services/expose-anfrage.service';
import { ExposeAnfrage } from '../../models/expose-anfrage.model';
import { SuccessMsgDialogComponent } from '../success-msg-dialog/success-msg-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { ImmobilienService } from '../../services/immobilien.service';
import { MediaAttachment } from '../../models/media.model';

@Component({
  selector: 'app-expose-anfordern',
  standalone: true,
  imports: [CommonModule, MATERIAL_MODULES, HttpClientModule], // ✅ HttpClientModule importieren
  templateUrl: './expose-anfordern.component.html',
  styleUrl: './expose-anfordern.component.scss',
})
export class ExposeAnfordernComponent {
  immobilie: Immobilie | null | undefined;
  contactForm: FormGroup;
  isSubmitting = false;
  formSubmitted = false;
  successMessage: string | null = null;
  media: MediaAttachment[] = [];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private exposeAnfrageService: ExposeAnfrageService,
    private immobilienService: ImmobilienService,
  ) {
    this.contactForm = this.fb.group({
      salutation: new FormControl(null, Validators.required),
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.minLength(3)]],
      street: ['', [Validators.required]],
      houseNumber: ['', [Validators.required]],
      zip: ['', [Validators.required]],
      city: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      company: [''],
      message: ['', [Validators.required]],
      acceptedTerms: [false, Validators.requiredTrue],
      acceptedWithdrawal: [false, Validators.requiredTrue],
      acceptedPrivacy: [false, Validators.requiredTrue],
    });
  
    this.route.queryParams.subscribe((params) => {
      const id = params['id'];
      console.log('Query-Parameter-ID:', id);
      if (id) {
        this.loadImmobilie(id);
        this.loadMedia(id); 
      }
    });
    
  
  }

  get firstNameControl() {
    return this.contactForm.get('firstName');
  }

  get lastNameControl() {
    return this.contactForm.get('lastName');
  }

  get emailControl() {
    return this.contactForm.get('email');
  }

  get messageControl() {
    return this.contactForm.get('message');
  }


  async loadImmobilie(id: string) {
    try {
      this.immobilie = await this.immobilienService.getImmobilieById(id);
    } catch (error) {
      console.error('Fehler beim Laden der Immobilie:', error);
      this.immobilie = null;
    }
  }

  async onSubmit(): Promise<void> {
    this.formSubmitted = true;

    if (this.contactForm.invalid || !this.immobilie) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const formData: ExposeAnfrage = {
      ...this.contactForm.value,
      immobilienId: this.immobilie.externalId,
      immobilienTyp: this.immobilie.propertyType,
    };

    try {
      await this.exposeAnfrageService.submitExposeAnfrage(formData);
      
      this.dialog.open(SuccessMsgDialogComponent, {
        panelClass: 'success-dialog',
        width: '350px',
      });
    } catch (err) {
      console.error('Fehler beim Senden der Anfrage:', err);
    } finally {
      this.isSubmitting = false;
    }
  }

  resetForm(): void {
    this.contactForm.reset();
  }

  get checkboxGroupValid(): boolean {
    return (
      this.contactForm.get('acceptedTerms')?.value &&
      this.contactForm.get('acceptedWithdrawal')?.value &&
      this.contactForm.get('acceptedPrivacy')?.value
    );
  }

  openWiderruf(): void {
    this.dialog.open(WiderrufComponent, {
      panelClass: 'details-dialog',
      width: '600px',
    });
  }

  openAGB(): void {
    this.dialog.open(AgbComponent, {
      panelClass: 'details-dialog',
      width: '600px',
    });
  }

  openDatenschutz(): void {
    this.dialog.open(DatenschutzComponent, {
      panelClass: 'details-dialog',
      width: '600px',
    });
  }

  async loadMedia(id: string) {
    try {
      const result = await this.immobilienService.getMediaForImmobilie(id);
      this.media = result ?? [];
    } catch (error) {
      console.error('Fehler beim Laden der Medien:', error);
      this.media = [];
    }
  }

  // close(): void {
  //   this.dialogRef.close();
  // }
}
