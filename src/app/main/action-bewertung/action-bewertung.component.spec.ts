import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionBewertungComponent } from './action-bewertung.component';

describe('ActionBewertungComponent', () => {
  let component: ActionBewertungComponent;
  let fixture: ComponentFixture<ActionBewertungComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionBewertungComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionBewertungComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
