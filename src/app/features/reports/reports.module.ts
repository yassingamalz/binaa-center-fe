import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { CaseReportsComponent } from './components/case-reports/case-reports.component';
import { FinancialReportsComponent } from './components/financial-reports/financial-reports.component';
import { StaffReportsComponent } from './components/staff-reports/staff-reports.component';
import { UnderConstructionComponent } from '../../shared/components/under-construction/under-construction.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'cases',
        component: CaseReportsComponent
      },
      {
        path: 'financial',
        component: UnderConstructionComponent
      },
      {
        path: 'staff',
        component: UnderConstructionComponent
      },
      {
        path: '',
        redirectTo: 'cases',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  declarations: [
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