import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaffListComponent } from './components/staff-list/staff-list.component';
import { StaffDetailsComponent } from './components/staff-details/staff-details.component';
import { StaffFormComponent } from './components/staff-form/staff-form.component';



@NgModule({
  declarations: [
    StaffListComponent,
    StaffDetailsComponent,
    StaffFormComponent
  ],
  imports: [
    CommonModule
  ]
})
export class StaffModule { }
