import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExposeAnfordernComponent } from './expose-anfordern.component';

describe('ExposeAnfordernComponent', () => {
  let component: ExposeAnfordernComponent;
  let fixture: ComponentFixture<ExposeAnfordernComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExposeAnfordernComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExposeAnfordernComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
