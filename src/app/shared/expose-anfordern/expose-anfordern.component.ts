import { Component, Inject } from '@angular/core';
import { Immobilie } from '../../models/immobilie.model';
import { CommonModule } from '@angular/common';
import { MATERIAL_MODULES } from '../material-imports';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http'; 
import { WiderrufComponent } from '../../impressum/widerruf/widerruf.component';
import { AgbComponent } from '../../impressum/agb/agb.component';
import { DatenschutzComponent } from '../../impressum/datenschutz/datenschutz.component';
import { ExposeAnfrageService } from '../../services/expose-anfrage.service';
import { ExposeAnfrage } from '../../models/expose-anfrage.model';
import { SuccessMsgDialogComponent } from '../success-msg-dialog/success-msg-dialog.component';

@Component({
  selector: 'app-expose-anfordern',
  standalone: true,
  imports: [CommonModule, MATERIAL_MODULES, HttpClientModule], // ✅ HttpClientModule importieren
  templateUrl: './expose-anfordern.component.html',
  styleUrl: './expose-anfordern.component.scss',
})
export class ExposeAnfordernComponent {
  immobilie: Immobilie;
  contactForm: FormGroup;
  isSubmitting = false;
  formSubmitted = false;
  successMessage: string | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { immobilie: Immobilie },
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ExposeAnfordernComponent>,
    private dialog: MatDialog,
    private exposeAnfrageService: ExposeAnfrageService,
    private http: HttpClient // ✅ für PHP-Mailversand
  ) {
    this.immobilie = data.immobilie;

    this.contactForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      company: [''],
      message: ['', [Validators.required]],
      acceptedTerms: [false, Validators.requiredTrue],
      acceptedWithdrawal: [false, Validators.requiredTrue],
      acceptedPrivacy: [false, Validators.requiredTrue],
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

  async onSubmit(): Promise<void> {
    this.formSubmitted = true;

    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const formData: ExposeAnfrage = {
      ...this.contactForm.value,
      immobilienId: this.immobilie.externalId,
      immobilienTyp: this.immobilie.propertyType
    };

    try {
      // 🔥 1. In Firebase DB speichern (wenn gewünscht)
      await this.exposeAnfrageService.submitExposeAnfrage(formData);

      // ✉️ 2. Mail per PHP-Skript senden
      await this.http.post(
        'https://immo.samuelhilgert.com/sendExposeAnfrageMail.php',
        formData
      ).toPromise();

      // ✅ Erfolg
      this.dialogRef.close();
      this.dialog.open(SuccessMsgDialogComponent, {
        panelClass: 'success-dialog',
        width: '350px'
      });
    } catch (err) {
      console.error('Fehler beim Versenden der E-Mail:', err);
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

  close(): void {
    this.dialogRef.close();
  }
}
