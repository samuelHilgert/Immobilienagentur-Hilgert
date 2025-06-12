import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyExposeSetsComponent } from './property-expose-sets.component';

describe('PropertyExposeSetsComponent', () => {
  let component: PropertyExposeSetsComponent;
  let fixture: ComponentFixture<PropertyExposeSetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyExposeSetsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyExposeSetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
