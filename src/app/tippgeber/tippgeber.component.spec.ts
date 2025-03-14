import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TippgeberComponent } from './tippgeber.component';

describe('TippgeberComponent', () => {
  let component: TippgeberComponent;
  let fixture: ComponentFixture<TippgeberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TippgeberComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TippgeberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
