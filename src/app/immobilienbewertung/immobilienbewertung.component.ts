import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-immobilienbewertung',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './immobilienbewertung.component.html',
  styleUrl: './immobilienbewertung.component.scss'
})
export class ImmobilienbewertungComponent {
  currentStep = 0;
  steps = [0, 1, 2, 3, 4];
  submitted = false;
  selectedFile: File | null = null;

  bewertungForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.bewertungForm = this.fb.group({
      propertyType: ['', Validators.required],
      street: ['', Validators.required],
      houseNumber: [''],
      postcode: ['', Validators.required],
      city: ['', Validators.required],
    
      // Dynamisch:
      etage: [''],
      balkon: [''],
      etagen: [''],
      keller: [''],
      erschlossen: [''],
    
      // Weiter wie gehabt
      beschreibung: [''],
      foto: [null],
      hinweise: [''],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefon: ['']
    });
    
  }

  get isWohnung(): boolean {
    return this.bewertungForm.get('propertyType')?.value === 'Wohnung';
  }
  
  get isHaus(): boolean {
    return this.bewertungForm.get('propertyType')?.value === 'Haus';
  }
  
  get isGrundstueck(): boolean {
    return this.bewertungForm.get('propertyType')?.value === 'Grundstück';
  }  

  nextStep() {
    const controlsToCheck = this.getControlsForCurrentStep();
    if (this.validateControls(controlsToCheck)) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (file) {
      this.selectedFile = file;
      this.bewertungForm.patchValue({ foto: file });
    }
  }

  onSubmit() {
    this.submitted = true;

    if (this.bewertungForm.valid) {
      console.log('✅ Formulardaten:', this.bewertungForm.value);
      alert('Vielen Dank! Wir melden uns innerhalb von 24 Stunden mit einer groben Einschätzung.');

      // Reset optional:
      this.bewertungForm.reset();
      this.currentStep = 0;
      this.submitted = false;
      this.selectedFile = null;

      // TODO: E-Mail oder API-Anbindung
    } else {
      alert('Bitte füllen Sie alle Pflichtfelder aus.');
    }
  }

  private getControlsForCurrentStep(): string[] {
    switch (this.currentStep) {
      case 0:
        return ['objektart', 'ort', 'wohnflaeche'];
      case 4:
        return ['name', 'email'];
      default:
        return [];
    }
  }

  private validateControls(controlNames: string[]): boolean {
    let isValid = true;
    controlNames.forEach(name => {
      const control = this.bewertungForm.get(name);
      if (control) {
        control.markAsTouched();
        control.updateValueAndValidity();
        if (control.invalid) {
          isValid = false;
        }
      }
    });
    return isValid;
  }
}
