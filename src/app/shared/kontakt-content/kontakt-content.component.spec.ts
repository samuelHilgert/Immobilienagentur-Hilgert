import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KontaktContentComponent } from './kontakt-content.component';

describe('KontaktContentComponent', () => {
  let component: KontaktContentComponent;
  let fixture: ComponentFixture<KontaktContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KontaktContentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KontaktContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
