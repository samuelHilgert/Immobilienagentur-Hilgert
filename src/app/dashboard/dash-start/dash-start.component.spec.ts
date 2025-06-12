import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashStartComponent } from './dash-start.component';

describe('DashStartComponent', () => {
  let component: DashStartComponent;
  let fixture: ComponentFixture<DashStartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashStartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashStartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
