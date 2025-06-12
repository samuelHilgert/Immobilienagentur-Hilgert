import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyImagesSetsComponent } from './property-images-sets.component';

describe('PropertyImagesSetsComponent', () => {
  let component: PropertyImagesSetsComponent;
  let fixture: ComponentFixture<PropertyImagesSetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyImagesSetsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyImagesSetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
