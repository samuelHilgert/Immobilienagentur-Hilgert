import { Component } from '@angular/core';
import { MATERIAL_MODULES } from '../material-imports';
import { RippleButtonDirective } from '../directives/RippleButtonDirective.directive';

@Component({
  selector: 'app-action-anfragen',
  standalone:true,
  imports: [MATERIAL_MODULES, RippleButtonDirective],
  templateUrl: './action-anfragen.component.html',
  styleUrl: './action-anfragen.component.scss'
})

export class ActionAnfragenComponent {

}
