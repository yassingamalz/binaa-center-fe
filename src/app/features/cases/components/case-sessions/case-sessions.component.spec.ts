import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseSessionsComponent } from './case-sessions.component';

describe('CaseSessionsComponent', () => {
  let component: CaseSessionsComponent;
  let fixture: ComponentFixture<CaseSessionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CaseSessionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CaseSessionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
