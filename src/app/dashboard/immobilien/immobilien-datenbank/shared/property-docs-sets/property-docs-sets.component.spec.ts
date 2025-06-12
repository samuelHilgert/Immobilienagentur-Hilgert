import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyDocsSetsComponent } from './property-docs-sets.component';

describe('PropertyDocsSetsComponent', () => {
  let component: PropertyDocsSetsComponent;
  let fixture: ComponentFixture<PropertyDocsSetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyDocsSetsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyDocsSetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
