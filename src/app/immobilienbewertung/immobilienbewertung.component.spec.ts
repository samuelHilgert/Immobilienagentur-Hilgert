import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImmobilienbewertungComponent } from './immobilienbewertung.component';

describe('ImmobilienbewertungComponent', () => {
  let component: ImmobilienbewertungComponent;
  let fixture: ComponentFixture<ImmobilienbewertungComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImmobilienbewertungComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImmobilienbewertungComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
