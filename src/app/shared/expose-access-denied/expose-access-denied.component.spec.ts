import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExposeAccessDeniedComponent } from './expose-access-denied.component';

describe('ExposeAccessDeniedComponent', () => {
  let component: ExposeAccessDeniedComponent;
  let fixture: ComponentFixture<ExposeAccessDeniedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExposeAccessDeniedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExposeAccessDeniedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
