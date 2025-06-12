import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KundeDetailsComponent } from './kunde-details.component';

describe('KundeDetailsComponent', () => {
  let component: KundeDetailsComponent;
  let fixture: ComponentFixture<KundeDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KundeDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KundeDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
