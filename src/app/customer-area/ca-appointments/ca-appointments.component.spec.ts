import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaAppointmentsComponent } from './ca-appointments.component';

describe('CaAppointmentsComponent', () => {
  let component: CaAppointmentsComponent;
  let fixture: ComponentFixture<CaAppointmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaAppointmentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaAppointmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
