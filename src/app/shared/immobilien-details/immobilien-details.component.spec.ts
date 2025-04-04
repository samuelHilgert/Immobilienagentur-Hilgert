import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImmobilienDetailsComponent } from './immobilien-details.component';

describe('ImmobilienDetailsComponent', () => {
  let component: ImmobilienDetailsComponent;
  let fixture: ComponentFixture<ImmobilienDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImmobilienDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImmobilienDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
