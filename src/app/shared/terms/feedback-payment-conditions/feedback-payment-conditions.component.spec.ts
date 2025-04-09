import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackPaymentConditionsComponent } from './feedback-payment-conditions.component';

describe('FeedbackPaymentConditionsComponent', () => {
  let component: FeedbackPaymentConditionsComponent;
  let fixture: ComponentFixture<FeedbackPaymentConditionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackPaymentConditionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedbackPaymentConditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
