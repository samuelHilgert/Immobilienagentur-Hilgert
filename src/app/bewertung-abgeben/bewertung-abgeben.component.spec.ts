import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BewertungAbgebenComponent } from './bewertung-abgeben.component';

describe('BewertungAbgebenComponent', () => {
  let component: BewertungAbgebenComponent;
  let fixture: ComponentFixture<BewertungAbgebenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BewertungAbgebenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BewertungAbgebenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
