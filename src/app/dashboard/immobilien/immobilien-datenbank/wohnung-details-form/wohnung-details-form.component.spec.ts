import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WohnungDetailsFormComponent } from './wohnung-details-form.component';

describe('WohnungDetailsFormComponent', () => {
  let component: WohnungDetailsFormComponent;
  let fixture: ComponentFixture<WohnungDetailsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WohnungDetailsFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WohnungDetailsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
