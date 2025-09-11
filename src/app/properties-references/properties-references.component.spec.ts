import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertiesReferencesComponent } from './properties-references.component';

describe('PropertiesReferencesComponent', () => {
  let component: PropertiesReferencesComponent;
  let fixture: ComponentFixture<PropertiesReferencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertiesReferencesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertiesReferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
