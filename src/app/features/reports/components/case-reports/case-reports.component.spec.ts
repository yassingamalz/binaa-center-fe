import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseReportsComponent } from './case-reports.component';

describe('CaseReportsComponent', () => {
  let component: CaseReportsComponent;
  let fixture: ComponentFixture<CaseReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CaseReportsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CaseReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
