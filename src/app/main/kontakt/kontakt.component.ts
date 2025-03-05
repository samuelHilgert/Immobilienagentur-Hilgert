import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MATERIAL_MODULES } from '../../shared/material-imports';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import AOS from 'aos';

@Component({
  selector: 'app-kontakt',
  standalone: true,
  imports: [ReactiveFormsModule, MATERIAL_MODULES],
  templateUrl: './kontakt.component.html',
  styleUrl: './kontakt.component.scss',
})
export class KontaktComponent implements OnInit {
  contactForm: FormGroup;
  isSubmitting = false;
  isBackVisible = false;
  
  // für socialMedia Icons
  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);
  
  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.contactForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      company: [''],
      subject: ['', Validators.required],
      message: ['', Validators.required]
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
   * Zeigt die Rückseite der Flip-Karte an
   */
  showBack(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.isBackVisible = true;
    this.refreshAOS();
  }
  
  /**
   * Zeigt die Vorderseite der Flip-Karte an
   */
  showFront(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.isBackVisible = false;
    this.refreshAOS();
  }
  
  /**
   * Form zurücksetzen mit Event-Stopper
   */
resetForm(event: Event) {
  event.stopPropagation();
  this.contactForm.reset();
}
  
  /**
   * AOS-Aktualisierung erzwingen, damit die Animation bei jedem Klick neu startet
   */
  private refreshAOS() {
    setTimeout(() => {
      AOS.refresh();
    }, 10);
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      
      // Simuliere einen API-Aufruf
      setTimeout(() => {
        this.isSubmitting = false;
        this.snackBar.open('Ihre Nachricht wurde erfolgreich gesendet!', 'Schließen', {
          duration: 5000,
          verticalPosition: 'top'
        });
        this.contactForm.reset();
      }, 1500);
    } else {
      // Markiere alle Felder als berührt, um Validierungsfehler anzuzeigen
      Object.keys(this.contactForm.controls).forEach(key => {
        const control = this.contactForm.get(key);
        control?.markAsTouched();
      });
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
}