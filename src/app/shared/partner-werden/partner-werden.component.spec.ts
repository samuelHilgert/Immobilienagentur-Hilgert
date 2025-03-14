import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerWerdenComponent } from './partner-werden.component';

describe('PartnerWerdenComponent', () => {
  let component: PartnerWerdenComponent;
  let fixture: ComponentFixture<PartnerWerdenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartnerWerdenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartnerWerdenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
