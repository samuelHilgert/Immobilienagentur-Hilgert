import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashAddFeedbackComponent } from './dash-add-feedback.component';

describe('DashAddFeedbackComponent', () => {
  let component: DashAddFeedbackComponent;
  let fixture: ComponentFixture<DashAddFeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashAddFeedbackComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashAddFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
