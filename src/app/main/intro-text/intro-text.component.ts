import { Component } from '@angular/core';
import { ScrollAnimationDirective } from '../../shared/directives/scroll-animation.directive';
import { ActionAnfragenComponent } from '../../shared/action-anfragen/action-anfragen.component';

@Component({
  selector: 'app-intro-text',
  standalone:true,
  imports: [ActionAnfragenComponent, ScrollAnimationDirective],
  templateUrl: './intro-text.component.html',
  styleUrl: './intro-text.component.scss'
})

export class IntroTextComponent {

}
