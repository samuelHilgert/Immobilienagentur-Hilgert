import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Immobilie } from '../../../../../models/immobilie.model';

@Component({
  selector: 'app-immo-edit-header',
  standalone:true,
  imports: [CommonModule, RouterModule],
  templateUrl: './immo-edit-header.component.html',
  styleUrl: './immo-edit-header.component.scss'
})


export class ImmoEditHeaderComponent {
  @Input() immobilie!: Immobilie;

}
