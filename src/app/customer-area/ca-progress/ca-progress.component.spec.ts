import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaProgressComponent } from './ca-progress.component';

describe('CaProgressComponent', () => {
  let component: CaProgressComponent;
  let fixture: ComponentFixture<CaProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaProgressComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
