import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WiderrufComponent } from './widerruf.component';

describe('WiderrufComponent', () => {
  let component: WiderrufComponent;
  let fixture: ComponentFixture<WiderrufComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WiderrufComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WiderrufComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
