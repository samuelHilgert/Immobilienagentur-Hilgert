import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImmoEditHeaderComponent } from './immo-edit-header.component';

describe('ImmoEditHeaderComponent', () => {
  let component: ImmoEditHeaderComponent;
  let fixture: ComponentFixture<ImmoEditHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImmoEditHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImmoEditHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
