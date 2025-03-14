import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImmobilienangeboteComponent } from './immobilienangebote.component';

describe('ImmobilienangeboteComponent', () => {
  let component: ImmobilienangeboteComponent;
  let fixture: ComponentFixture<ImmobilienangeboteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImmobilienangeboteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImmobilienangeboteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
