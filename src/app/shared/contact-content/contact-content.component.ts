
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  MatDialogRef,
} from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import AOS from 'aos';
import { KontaktAnfrageService } from '../../services/kontakt-anfrage.service';
import { KontaktAnfrage } from '../../models/kontakt-anfrage.model';
import { DatenschutzComponent } from '../../impressum/datenschutz/datenschutz.component';
import { MatDialog } from '@angular/material/dialog';
import { MATERIAL_MODULES } from '../material-imports';
import { SuccessMsgDialogComponent } from '../success-msg-dialog/success-msg-dialog.component';

@Component({
  selector: 'app-contact-content',
  standalone: true,
  imports: [ReactiveFormsModule, MATERIAL_MODULES],
  templateUrl: './contact-content.component.html',
  styleUrl: './contact-content.component.scss'
})
export class ContactContentComponent implements OnInit {
  contactForm: FormGroup;
  isSubmitting = false;
  
  // für socialMedia Icons
  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);
  
  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private kontaktAnfrageService: KontaktAnfrageService
  ) {
    this.contactForm = this.fb.group({
      salutation: new FormControl(null, Validators.required),
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      company: [''],
      subject: ['', Validators.required],
      message: ['', Validators.required],
      acceptedPrivacy: [false, Validators.requiredTrue]
    });    
    
    this.registerSocialIcons();
  }
  
  get firstNameControl() { return this.contactForm.get('firstName'); }
  get lastNameControl() { return this.contactForm.get('lastName'); }
  get emailControl() { return this.contactForm.get('email'); }
  get subjectControl() { return this.contactForm.get('subject'); }
  get messageControl() { return this.contactForm.get('message'); }
  
  ngOnInit() {
    // AOS initialisieren
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: false,
      mirror: true,
    });
  }
  
  /**
   * Form zurücksetzen
   */
  resetForm() {
    this.contactForm.reset();
  }
  
  async onSubmit(): Promise<void> {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }
  
    this.isSubmitting = true;
  
    const formData: KontaktAnfrage = {
      contactCustomerId: '', // wird im Service ersetzt
      salutation: this.contactForm.value.salutation,
      company: this.contactForm.value.company || '',
      firstName: this.contactForm.value.firstName,
      lastName: this.contactForm.value.lastName,
      email: this.contactForm.value.email,
      phone: this.contactForm.value.phone || '',
      subject: this.contactForm.value.subject,
      message: this.contactForm.value.message,
      acceptedPrivacy: this.contactForm.value.acceptedPrivacy,
    };    
  
    try {
      const result = await this.kontaktAnfrageService.submitKontaktAnfrage(formData);
  
      if (result.success) {
        this.contactForm.reset();
  
        // 📬 Dialog anzeigen
        this.dialog.open(SuccessMsgDialogComponent, {
          panelClass: 'success-dialog',
          width: '350px'
        });
      } else {
        throw result.error;
      }
    } catch (error) {
      console.error('Fehler beim Versenden:', error);
      this.snackBar.open('Fehler beim Versenden Ihrer Nachricht. Bitte versuchen Sie es später erneut.', 'Schließen', {
        duration: 5000,
        verticalPosition: 'top'
      });
    } finally {
      this.isSubmitting = false;
    }
  }  
  
  private registerSocialIcons(): void {
    const icons = [
      { name: 'instagram', path: 'assets/icons/instagram.svg' },
      { name: 'facebook', path: 'assets/icons/facebook.svg' },
      { name: 'tiktok', path: 'assets/icons/tiktok.svg' },
      { name: 'youtube', path: 'assets/icons/youtube.svg' },
      { name: 'xing', path: 'assets/icons/xing.svg' },
      { name: 'linkedin', path: 'assets/icons/linkedin.svg' }
    ];
    
    icons.forEach(icon => {
      this.iconRegistry.addSvgIcon(
        icon.name,
        this.sanitizer.bypassSecurityTrustResourceUrl(icon.path)
      );
    });
  }

  openDatenschutz(): void {
    this.dialog.open(DatenschutzComponent, {
      panelClass: 'details-dialog',
      width: '600px',
    });
  }

}