import { Component } from '@angular/core';
import { ScrollAnimationDirective } from '../../shared/directives/scroll-animation.directive';

@Component({
  selector: 'app-intro-text',
  standalone:true,
  imports: [ScrollAnimationDirective],
  templateUrl: './intro-text.component.html',
  styleUrl: './intro-text.component.scss'
})

export class IntroTextComponent {

}
