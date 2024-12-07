import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssessmentListComponent } from './components/assessment-list/assessment-list.component';
import { AssessmentDetailsComponent } from './components/assessment-details/assessment-details.component';
import { AssessmentFormComponent } from './components/assessment-form/assessment-form.component';



@NgModule({
  declarations: [
    AssessmentListComponent,
    AssessmentDetailsComponent,
    AssessmentFormComponent
  ],
  imports: [
    CommonModule
  ]
})
export class AssessmentsModule { }
