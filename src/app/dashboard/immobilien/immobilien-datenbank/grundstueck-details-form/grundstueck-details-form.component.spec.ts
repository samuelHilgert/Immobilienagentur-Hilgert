import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrundstueckDetailsFormComponent } from './grundstueck-details-form.component';

describe('GrundstueckDetailsFormComponent', () => {
  let component: GrundstueckDetailsFormComponent;
  let fixture: ComponentFixture<GrundstueckDetailsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GrundstueckDetailsFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GrundstueckDetailsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
