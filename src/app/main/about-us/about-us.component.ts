import { Component } from '@angular/core';
import { ActionAnfragenComponent } from '../../shared/action-anfragen/action-anfragen.component';

@Component({
  selector: 'app-about-us',
  standalone:true,
  imports: [ActionAnfragenComponent],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.scss'
})
export class AboutUsComponent {

}
