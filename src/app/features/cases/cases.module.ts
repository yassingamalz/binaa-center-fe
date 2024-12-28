import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModalModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';

// Components
import { CaseListComponent } from './components/case-list/case-list.component';
import { CaseDetailsComponent } from './components/case-details/case-details.component';
import { CaseFormComponent } from './components/case-form/case-form.component';

// Services
import { CaseService } from './services/case.service';
import { CaseSessionsComponent } from './components/case-sessions/case-sessions.component';
import { CaseAssessmentsComponent } from './components/case-assessments/case-assessments.component';
import { CasePaymentsComponent } from './components/case-payments/case-payments.component';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: CaseListComponent
  },
  {
    path: 'new',
    component: CaseFormComponent
  },
  {
    path: ':id',
    component: CaseDetailsComponent
  },
];

@NgModule({
  declarations: [
    CaseListComponent,
    CaseDetailsComponent,
    CaseFormComponent,
    CaseSessionsComponent,
    CaseAssessmentsComponent,
    CasePaymentsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),
    NgbModule,
    NgbModalModule,
    SharedModule
  ],
  providers: [
    CaseService
  ]
})
export class CasesModule { }