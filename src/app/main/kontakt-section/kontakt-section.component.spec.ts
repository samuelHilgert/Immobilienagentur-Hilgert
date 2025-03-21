import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KontaktSectionComponent } from './kontakt-section.component';

describe('KontaktSectionComponent', () => {
  let component: KontaktSectionComponent;
  let fixture: ComponentFixture<KontaktSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KontaktSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KontaktSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
