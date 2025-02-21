import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImmobilieAnlegenComponent } from './immobilie-anlegen.component';

describe('ImmobilieAnlegenComponent', () => {
  let component: ImmobilieAnlegenComponent;
  let fixture: ComponentFixture<ImmobilieAnlegenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImmobilieAnlegenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImmobilieAnlegenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
