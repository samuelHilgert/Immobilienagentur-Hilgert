import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MATERIAL_MODULES } from '../material-imports';

@Component({
  selector: 'app-footer',
  standalone:true,
  imports: [RouterLink, MATERIAL_MODULES],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {

}
