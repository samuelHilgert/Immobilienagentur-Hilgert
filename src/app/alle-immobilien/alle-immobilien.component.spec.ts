import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlleImmobilienComponent } from './alle-immobilien.component';

describe('AlleImmobilienComponent', () => {
  let component: AlleImmobilienComponent;
  let fixture: ComponentFixture<AlleImmobilienComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlleImmobilienComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlleImmobilienComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
