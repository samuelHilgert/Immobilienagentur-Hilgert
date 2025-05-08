import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpxosePreviewComponent } from './epxose-preview.component';

describe('EpxosePreviewComponent', () => {
  let component: EpxosePreviewComponent;
  let fixture: ComponentFixture<EpxosePreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EpxosePreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EpxosePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
