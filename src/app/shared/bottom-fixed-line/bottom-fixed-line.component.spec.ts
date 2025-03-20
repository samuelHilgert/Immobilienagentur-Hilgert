import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomFixedLineComponent } from './bottom-fixed-line.component';

describe('BottomFixedLineComponent', () => {
  let component: BottomFixedLineComponent;
  let fixture: ComponentFixture<BottomFixedLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomFixedLineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BottomFixedLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
