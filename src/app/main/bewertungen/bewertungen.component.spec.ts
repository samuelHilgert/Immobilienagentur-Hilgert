import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BewertungenComponent } from './bewertungen.component';

describe('AwardsComponent', () => {
  let component: BewertungenComponent;
  let fixture: ComponentFixture<BewertungenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BewertungenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BewertungenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
