import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuchauftraegeComponent } from './suchauftraege.component';

describe('SuchauftraegeComponent', () => {
  let component: SuchauftraegeComponent;
  let fixture: ComponentFixture<SuchauftraegeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuchauftraegeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuchauftraegeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
