import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyProcessViewComponent } from './property-process-view.component';

describe('PropertyProcessViewComponent', () => {
  let component: PropertyProcessViewComponent;
  let fixture: ComponentFixture<PropertyProcessViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyProcessViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyProcessViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
