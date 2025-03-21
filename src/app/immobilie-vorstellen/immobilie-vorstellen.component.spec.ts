import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImmobilieVorstellenComponent } from './immobilie-vorstellen.component';

describe('ImmobilieVorstellenComponent', () => {
  let component: ImmobilieVorstellenComponent;
  let fixture: ComponentFixture<ImmobilieVorstellenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImmobilieVorstellenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImmobilieVorstellenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
