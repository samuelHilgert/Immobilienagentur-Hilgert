import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessMsgDialogComponent } from './success-msg-dialog.component';

describe('SuccessMsgDialogComponent', () => {
  let component: SuccessMsgDialogComponent;
  let fixture: ComponentFixture<SuccessMsgDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuccessMsgDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuccessMsgDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
