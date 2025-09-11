import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketValueCalcComponent } from './market-value-calc.component';

describe('MarketValueCalcComponent', () => {
  let component: MarketValueCalcComponent;
  let fixture: ComponentFixture<MarketValueCalcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketValueCalcComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketValueCalcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
