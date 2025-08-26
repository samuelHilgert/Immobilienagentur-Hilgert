import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaDocsComponent } from './ca-docs.component';

describe('CaDocsComponent', () => {
  let component: CaDocsComponent;
  let fixture: ComponentFixture<CaDocsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaDocsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaDocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
