import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkPresentationComponent } from './work-presentation.component';

describe('WorkPresentationComponent', () => {
  let component: WorkPresentationComponent;
  let fixture: ComponentFixture<WorkPresentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkPresentationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkPresentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
