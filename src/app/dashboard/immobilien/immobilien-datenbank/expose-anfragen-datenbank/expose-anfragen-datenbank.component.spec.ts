import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExposeAnfragenDatenbankComponent } from './expose-anfragen-datenbank.component';

describe('ExposeAnfragenDatenbankComponent', () => {
  let component: ExposeAnfragenDatenbankComponent;
  let fixture: ComponentFixture<ExposeAnfragenDatenbankComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExposeAnfragenDatenbankComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExposeAnfragenDatenbankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
