import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UmsatzComponent } from './umsatz.component';

describe('UmsatzComponent', () => {
  let component: UmsatzComponent;
  let fixture: ComponentFixture<UmsatzComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UmsatzComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UmsatzComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
