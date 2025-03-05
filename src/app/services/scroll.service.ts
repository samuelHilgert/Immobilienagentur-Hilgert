// scroll.service.ts
import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {
  private isHeaderVisible = new BehaviorSubject<boolean>(true);
  
  constructor(private ngZone: NgZone) {
    this.ngZone.runOutsideAngular(() => {
      // Auf alle Scroll-Events im Dokument hören (Capture-Phase)
      document.addEventListener('scroll', (event) => {
        // Nur ausführen, wenn es sich um ein Container-Element handelt
        if (event.target && event.target !== document) {
          const scrollingElement = event.target as Element;
          
          this.ngZone.run(() => {
            // Header verstecken, wenn das Element mehr als 50px gescrollt wurde
            const currentState = scrollingElement.scrollTop <= 100;
            if (currentState !== this.isHeaderVisible.value) {
              this.isHeaderVisible.next(currentState);
            }
          });
        }
      }, true); // true ist wichtig für die Capture-Phase
    });
  }

  get headerVisibility(): Observable<boolean> {
    return this.isHeaderVisible.asObservable();
  }
}