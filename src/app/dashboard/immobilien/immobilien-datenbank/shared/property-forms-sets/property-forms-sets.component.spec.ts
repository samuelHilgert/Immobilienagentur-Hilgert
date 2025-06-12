import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyFormsSetsComponent } from './property-forms-sets.component';

describe('PropertyFormsSetsComponent', () => {
  let component: PropertyFormsSetsComponent;
  let fixture: ComponentFixture<PropertyFormsSetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyFormsSetsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyFormsSetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
