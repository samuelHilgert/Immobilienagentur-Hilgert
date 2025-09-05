import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarRidesComponent } from './car-rides.component';

describe('CarRidesComponent', () => {
  let component: CarRidesComponent;
  let fixture: ComponentFixture<CarRidesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarRidesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarRidesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
