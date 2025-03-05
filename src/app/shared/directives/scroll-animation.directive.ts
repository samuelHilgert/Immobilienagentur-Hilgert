// scroll-animation.directive.ts
import { Directive, ElementRef, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appScrollAnimation]',
  standalone: true
})
export class ScrollAnimationDirective implements OnInit {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    const options = {
      root: null, // viewport als Referenz
      rootMargin: '0px',
      threshold: 0.1 // 10% des Elements muss sichtbar sein
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Element ist im Viewport
          this.renderer.addClass(this.el.nativeElement, 'animate');
          observer.unobserve(this.el.nativeElement); // Beobachtung beenden, wenn Animation gestartet
        }
      });
    }, options);

    // Starte die Beobachtung des Elements
    observer.observe(this.el.nativeElement);
  }
}