import { Component } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { MATERIAL_MODULES } from '../shared/material-imports';

@Component({
  selector: 'app-immobilienangebote',
  standalone:true,
  imports: [MATERIAL_MODULES],
  templateUrl: './immobilienangebote.component.html',
  styleUrl: './immobilienangebote.component.scss'
})

export class ImmobilienangeboteComponent {

}
