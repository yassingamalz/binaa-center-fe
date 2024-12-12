// src/app/features/assessments/assessments.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// Components
import { AssessmentListComponent } from './components/assessment-list/assessment-list.component';
import { AssessmentDetailsComponent } from './components/assessment-details/assessment-details.component';
import { AssessmentFormComponent } from './components/assessment-form/assessment-form.component';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: AssessmentListComponent,
    data: { title: 'التقييمات' }
  },
  {
    path: ':id',
    component: AssessmentDetailsComponent,
    data: { title: 'تفاصيل التقييم' }
  }
];

@NgModule({
  declarations: [
    AssessmentListComponent,
    AssessmentDetailsComponent,
    AssessmentFormComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    NgbModule,
    SharedModule
  ],
  exports: [
    AssessmentListComponent,
    AssessmentFormComponent
  ],
  providers: [
  ]
})
export class AssessmentsModule { }