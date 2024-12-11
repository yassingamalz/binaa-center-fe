import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseAssessmentsComponent } from './case-assessments.component';

describe('CaseAssessmentsComponent', () => {
  let component: CaseAssessmentsComponent;
  let fixture: ComponentFixture<CaseAssessmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CaseAssessmentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CaseAssessmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
