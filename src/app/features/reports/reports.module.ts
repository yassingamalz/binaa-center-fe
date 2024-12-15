import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { ReportsPageComponent } from './pages/reports-page/reports-page.component';
import { CaseReportsComponent } from './components/case-reports/case-reports.component';
import { FinancialReportsComponent } from './components/financial-reports/financial-reports.component';
import { StaffReportsComponent } from './components/staff-reports/staff-reports.component';

const routes: Routes = [
  {
    path: '',
    component: ReportsPageComponent
  }
];

@NgModule({
  declarations: [
    ReportsPageComponent,
    CaseReportsComponent,
    FinancialReportsComponent,
    StaffReportsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class ReportsModule { }