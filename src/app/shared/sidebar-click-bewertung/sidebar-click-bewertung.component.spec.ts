import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarClickBewertungComponent } from './sidebar-click-bewertung.component';

describe('SidebarClickBewertungComponent', () => {
  let component: SidebarClickBewertungComponent;
  let fixture: ComponentFixture<SidebarClickBewertungComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarClickBewertungComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarClickBewertungComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
