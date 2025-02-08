import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionNewsletterComponent } from './action-newsletter.component';

describe('ActionNewsletterComponent', () => {
  let component: ActionNewsletterComponent;
  let fixture: ComponentFixture<ActionNewsletterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionNewsletterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionNewsletterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
