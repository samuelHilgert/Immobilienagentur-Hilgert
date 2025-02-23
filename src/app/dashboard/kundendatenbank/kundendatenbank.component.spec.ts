import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KundendatenbankComponent } from './kundendatenbank.component';

describe('KundendatenbankComponent', () => {
  let component: KundendatenbankComponent;
  let fixture: ComponentFixture<KundendatenbankComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KundendatenbankComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KundendatenbankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
