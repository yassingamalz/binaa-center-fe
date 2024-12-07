import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CaseReportsComponent } from './components/case-reports/case-reports.component';
import { FinancialReportsComponent } from './components/financial-reports/financial-reports.component';
import { StaffReportsComponent } from './components/staff-reports/staff-reports.component';



@NgModule({
  declarations: [
    CaseReportsComponent,
    FinancialReportsComponent,
    StaffReportsComponent
  ],
  imports: [
    CommonModule
  ]
})
export class ReportsModule { }
