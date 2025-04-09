import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackForCashComponent } from './feedback-for-cash.component';

describe('FeedbackForCashComponent', () => {
  let component: FeedbackForCashComponent;
  let fixture: ComponentFixture<FeedbackForCashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackForCashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedbackForCashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
