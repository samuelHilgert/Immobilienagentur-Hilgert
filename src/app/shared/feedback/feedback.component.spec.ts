import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BewertenComponent } from './feedback.component';

describe('BewertenComponent', () => {
  let component: BewertenComponent;
  let fixture: ComponentFixture<BewertenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BewertenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BewertenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
