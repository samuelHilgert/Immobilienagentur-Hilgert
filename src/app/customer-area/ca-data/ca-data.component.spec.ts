import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaDataComponent } from './ca-data.component';

describe('CaDataComponent', () => {
  let component: CaDataComponent;
  let fixture: ComponentFixture<CaDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
