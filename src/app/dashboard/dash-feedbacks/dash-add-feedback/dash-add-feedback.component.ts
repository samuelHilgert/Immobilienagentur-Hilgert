import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MATERIAL_MODULES } from '../../../shared/material-imports';

@Component({
  selector: 'app-dash-add-feedback',
  standalone: true,
  imports: [RouterModule, MATERIAL_MODULES],
  templateUrl: './dash-add-feedback.component.html',
  styleUrl: './dash-add-feedback.component.scss'
})
export class DashAddFeedbackComponent {

}
