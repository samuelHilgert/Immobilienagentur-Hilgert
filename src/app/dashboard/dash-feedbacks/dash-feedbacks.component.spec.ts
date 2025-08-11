import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashFeedbacksComponent } from './dash-feedbacks.component';

describe('DashFeedbacksComponent', () => {
  let component: DashFeedbacksComponent;
  let fixture: ComponentFixture<DashFeedbacksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashFeedbacksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashFeedbacksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
