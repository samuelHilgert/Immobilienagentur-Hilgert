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
      let lastScrollTop = 0;
    
      window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const visible = scrollTop < lastScrollTop || scrollTop < 100;
    
        if (visible !== this.isHeaderVisible.value) {
          this.ngZone.run(() => {
            this.isHeaderVisible.next(visible);
          });
        }
    
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
      }, { passive: true });
    });
    
  }

  get headerVisibility(): Observable<boolean> {
    return this.isHeaderVisible.asObservable();
  }
}