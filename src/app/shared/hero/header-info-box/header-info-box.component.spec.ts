import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderInfoBoxComponent } from './header-info-box.component';

describe('HeaderInfoBoxComponent', () => {
  let component: HeaderInfoBoxComponent;
  let fixture: ComponentFixture<HeaderInfoBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderInfoBoxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderInfoBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
