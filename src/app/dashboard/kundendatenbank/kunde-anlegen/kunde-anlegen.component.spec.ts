import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KundeAnlegenComponent } from './kunde-anlegen.component';

describe('KundeAnlegenComponent', () => {
  let component: KundeAnlegenComponent;
  let fixture: ComponentFixture<KundeAnlegenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KundeAnlegenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KundeAnlegenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
