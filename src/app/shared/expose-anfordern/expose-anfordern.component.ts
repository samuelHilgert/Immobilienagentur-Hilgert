import { Component, OnInit } from '@angular/core';
import { Immobilie } from '../../models/immobilie.model';
import { CommonModule } from '@angular/common';
import { MATERIAL_MODULES } from '../material-imports';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { WiderrufComponent } from '../../impressum/widerruf/widerruf.component';
import { AgbComponent } from '../../impressum/agb/agb.component';
import { DatenschutzComponent } from '../../impressum/datenschutz/datenschutz.component';
import { ExposeAnfrageService } from '../../services/expose-anfrage.service';
import { SuccessMsgDialogComponent } from '../success-msg-dialog/success-msg-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { ImmobilienService } from '../../services/immobilien.service';
import { MediaAttachment } from '../../models/media.model';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { collection, doc } from 'firebase/firestore';
import { MatDialog } from '@angular/material/dialog';
import { ExposeAnfrageDto } from '../../models/expose-anfrage.model';
import { MediaService } from '../../services/media.service';

@Component({
  selector: 'app-expose-anfordern',
  standalone: true,
  imports: [CommonModule, MATERIAL_MODULES, HttpClientModule],
  templateUrl: './expose-anfordern.component.html',
  styleUrl: './expose-anfordern.component.scss',
})
export class ExposeAnfordernComponent implements OnInit{
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
    private mediaService: MediaService,
    private exposeAnfrageService: ExposeAnfrageService,
    private immobilienService: ImmobilienService
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
      // console.log('Query-Parameter-ID:', id);
      if (id) {
        this.loadImmobilie(id);
        this.loadMedia(id);
      }
    });
  }

  ngOnInit(): void {
    const user = getAuth().currentUser;
    // console.log('👤 Aktueller User:', user?.uid, 'anonym:', user?.isAnonymous);
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
  
    try {
      const auth = getAuth();
      if (!auth.currentUser) {
        const cred = await signInAnonymously(auth);
        console.log('✅ Anonym eingeloggt vor Anfrage:', cred.user.uid);
      }
  
      // 🔑 Eindeutige ID für Kunde + Anfrage
      const sharedRef = doc(collection(this.exposeAnfrageService.firestore, 'customers'));
      const sharedId = sharedRef.id;
  
      // 🧾 Anfrage-Daten vorbereiten
      const dto: ExposeAnfrageDto = {
        requestCustomerId: sharedId,
        requestPropertyId: this.immobilie?.externalId ?? '',
        salutation: this.contactForm.value.salutation,
        company: this.contactForm.value.company || '',
        firstName: this.contactForm.value.firstName,
        lastName: this.contactForm.value.lastName,
        street: this.contactForm.value.street,
        houseNumber: this.contactForm.value.houseNumber,
        zip: this.contactForm.value.zip,
        city: this.contactForm.value.city,
        email: this.contactForm.value.email,
        phone: this.contactForm.value.phone,
        message: this.contactForm.value.message,
        acceptedTerms: this.contactForm.value.acceptedTerms,
        acceptedWithdrawal: this.contactForm.value.acceptedWithdrawal,
        acceptedPrivacy: this.contactForm.value.acceptedPrivacy,
      };
  
      // 📤 Anfrage absenden
      await this.exposeAnfrageService.submitExposeAnfrage(dto, sharedId);
  
      // ✅ Erfolgsmeldung anzeigen
      this.dialog.open(SuccessMsgDialogComponent, {
        panelClass: 'success-dialog',
        width: '350px',
      });
  
      this.resetForm();
      this.formSubmitted = false;
    } catch (err) {
      console.error('Fehler beim Senden der Anfrage:', err);
    } finally {
      this.isSubmitting = false;
    }
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

  getTitleImage(): MediaAttachment | undefined {
    return this.mediaService.getTitleImage(this.media);
  }  

  resetForm(): void {
    this.contactForm.reset({
      salutation: null,
      firstName: '',
      lastName: '',
      street: '',
      houseNumber: '',
      zip: '',
      city: '',
      email: '',
      phone: '',
      company: '',
      message: '',
      acceptedTerms: false,
      acceptedWithdrawal: false,
      acceptedPrivacy: false,
    });

    this.contactForm.markAsPristine();
    this.contactForm.markAsUntouched();
  }

  get checkboxGroupValid(): boolean {
    return (
      this.contactForm.get('acceptedTerms')?.value &&
      this.contactForm.get('acceptedWithdrawal')?.value &&
      this.contactForm.get('acceptedPrivacy')?.value
    );
  }
  

}
