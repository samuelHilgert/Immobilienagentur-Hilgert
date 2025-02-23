import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AblageComponent } from './ablage.component';

describe('AblageComponent', () => {
  let component: AblageComponent;
  let fixture: ComponentFixture<AblageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AblageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AblageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
