import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergieklasseDiagrammComponent } from './energieklasse-diagramm.component';

describe('EnergieklasseDiagrammComponent', () => {
  let component: EnergieklasseDiagrammComponent;
  let fixture: ComponentFixture<EnergieklasseDiagrammComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnergieklasseDiagrammComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnergieklasseDiagrammComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
