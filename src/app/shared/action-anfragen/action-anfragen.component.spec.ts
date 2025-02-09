import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionAnfragenComponent } from './action-anfragen.component';

describe('ActionAnfragenComponent', () => {
  let component: ActionAnfragenComponent;
  let fixture: ComponentFixture<ActionAnfragenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionAnfragenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionAnfragenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
