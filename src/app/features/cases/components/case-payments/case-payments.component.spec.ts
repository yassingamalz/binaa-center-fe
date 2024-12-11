import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CasePaymentsComponent } from './case-payments.component';

describe('CasePaymentsComponent', () => {
  let component: CasePaymentsComponent;
  let fixture: ComponentFixture<CasePaymentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CasePaymentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CasePaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
