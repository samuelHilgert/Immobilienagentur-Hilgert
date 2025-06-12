import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtocolInquiryPropertyComponent } from './protocol-inquiry-property.component';

describe('ProtocolInquiryPropertyComponent', () => {
  let component: ProtocolInquiryPropertyComponent;
  let fixture: ComponentFixture<ProtocolInquiryPropertyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProtocolInquiryPropertyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProtocolInquiryPropertyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
