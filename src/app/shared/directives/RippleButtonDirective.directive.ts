// ripple-button.directive.ts
import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appRippleButton]',
  standalone: true
})
export class RippleButtonDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {
    // Stelle sicher, dass der Button die richtigen Styles hat
    this.renderer.setStyle(this.el.nativeElement, 'position', 'relative');
    this.renderer.setStyle(this.el.nativeElement, 'overflow', 'hidden');
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    // Konsolen-Ausgabe zur Fehlersuche
    console.log('Click event detected', event.clientX, event.clientY);
    
    const button = this.el.nativeElement;
    const rect = button.getBoundingClientRect();
    
    // Konsolen-Ausgabe zur Fehlersuche
    console.log('Button rect', rect.left, rect.top, rect.width, rect.height);
    
    // Ripple-Element erstellen
    const ripple = this.renderer.createElement('span');
    this.renderer.addClass(ripple, 'ripple-effect');
    
    // Position relativ zum Button berechnen
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Durchmesser berechnen (2 * maximale mögliche Entfernung vom Klickpunkt zur Ecke)
    const dx = Math.max(x, rect.width - x);
    const dy = Math.max(y, rect.height - y);
    const diameter = Math.sqrt(dx * dx + dy * dy) * 2;
    
    // Ripple positionieren und stylen
    this.renderer.setStyle(ripple, 'width', `${diameter}px`);
    this.renderer.setStyle(ripple, 'height', `${diameter}px`);
    this.renderer.setStyle(ripple, 'left', `${x - diameter/2}px`);
    this.renderer.setStyle(ripple, 'top', `${y - diameter/2}px`);
    
    // Konsolen-Ausgabe zur Fehlersuche
    console.log('Ripple position', x, y, diameter);
    
    // Ripple zum Button hinzufügen
    this.renderer.appendChild(button, ripple);
    
    // Ripple nach Animation entfernen
    setTimeout(() => {
      this.renderer.removeChild(button, ripple);
    }, 600);
  }
}