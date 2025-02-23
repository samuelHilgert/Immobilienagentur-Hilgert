import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImmobilienComponent } from './immobilien.component';

describe('ImmobilienComponent', () => {
  let component: ImmobilienComponent;
  let fixture: ComponentFixture<ImmobilienComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImmobilienComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImmobilienComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
