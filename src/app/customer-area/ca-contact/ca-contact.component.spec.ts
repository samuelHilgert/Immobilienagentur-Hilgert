import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaContactComponent } from './ca-contact.component';

describe('CaContactComponent', () => {
  let component: CaContactComponent;
  let fixture: ComponentFixture<CaContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaContactComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
