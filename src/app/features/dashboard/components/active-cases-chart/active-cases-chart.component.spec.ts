import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveCasesChartComponent } from './active-cases-chart.component';

describe('ActiveCasesChartComponent', () => {
  let component: ActiveCasesChartComponent;
  let fixture: ComponentFixture<ActiveCasesChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActiveCasesChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActiveCasesChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
