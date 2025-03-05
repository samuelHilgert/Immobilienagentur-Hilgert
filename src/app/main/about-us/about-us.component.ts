import { Component } from '@angular/core';
import { ActionAnfragenComponent } from '../../shared/action-anfragen/action-anfragen.component';
import { ScrollAnimationDirective } from '../../shared/directives/scroll-animation.directive';

@Component({
  selector: 'app-about-us',
  standalone:true,
  imports: [ActionAnfragenComponent, ScrollAnimationDirective],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.scss'
})
export class AboutUsComponent {

}
