import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HausDetailsFormComponent } from './haus-details-form.component';

describe('HausDetailsFormComponent', () => {
  let component: HausDetailsFormComponent;
  let fixture: ComponentFixture<HausDetailsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HausDetailsFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HausDetailsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
