import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImmobilienDatenbankComponent } from './immobilien-datenbank.component';

describe('ImmobilienDatenbankComponent', () => {
  let component: ImmobilienDatenbankComponent;
  let fixture: ComponentFixture<ImmobilienDatenbankComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImmobilienDatenbankComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImmobilienDatenbankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
