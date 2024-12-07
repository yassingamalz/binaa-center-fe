import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CaseListComponent } from './components/case-list/case-list.component';
import { CaseDetailsComponent } from './components/case-details/case-details.component';
import { CaseFormComponent } from './components/case-form/case-form.component';



@NgModule({
  declarations: [
    CaseListComponent,
    CaseDetailsComponent,
    CaseFormComponent
  ],
  imports: [
    CommonModule
  ]
})
export class CasesModule { }
