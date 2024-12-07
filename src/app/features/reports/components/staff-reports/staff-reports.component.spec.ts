import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffReportsComponent } from './staff-reports.component';

describe('StaffReportsComponent', () => {
  let component: StaffReportsComponent;
  let fixture: ComponentFixture<StaffReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StaffReportsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StaffReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
