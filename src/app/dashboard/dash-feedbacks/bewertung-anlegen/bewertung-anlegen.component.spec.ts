import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BewertungAnlegenComponent } from './bewertung-anlegen.component';

describe('BewertungAnlegenComponent', () => {
  let component: BewertungAnlegenComponent;
  let fixture: ComponentFixture<BewertungAnlegenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BewertungAnlegenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BewertungAnlegenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
