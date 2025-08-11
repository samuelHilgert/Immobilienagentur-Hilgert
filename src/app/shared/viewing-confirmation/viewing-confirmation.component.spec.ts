import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewingConfirmationComponent } from './viewing-confirmation.component';

describe('ViewingConfirmationComponent', () => {
  let component: ViewingConfirmationComponent;
  let fixture: ComponentFixture<ViewingConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewingConfirmationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewingConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
