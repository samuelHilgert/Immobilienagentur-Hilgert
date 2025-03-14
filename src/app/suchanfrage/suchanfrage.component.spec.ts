import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuchanfrageComponent } from './suchanfrage.component';

describe('SuchanfrageComponent', () => {
  let component: SuchanfrageComponent;
  let fixture: ComponentFixture<SuchanfrageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuchanfrageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuchanfrageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
