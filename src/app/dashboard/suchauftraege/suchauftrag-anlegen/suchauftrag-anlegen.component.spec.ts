import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuchauftragAnlegenComponent } from './suchauftrag-anlegen.component';

describe('SuchauftragAnlegenComponent', () => {
  let component: SuchauftragAnlegenComponent;
  let fixture: ComponentFixture<SuchauftragAnlegenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuchauftragAnlegenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuchauftragAnlegenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
