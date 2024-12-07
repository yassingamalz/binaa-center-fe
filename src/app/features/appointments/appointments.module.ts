import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentListComponent } from './components/appointment-list/appointment-list.component';
import { AppointmentCalendarComponent } from './components/appointment-calendar/appointment-calendar.component';
import { AppointmentFormComponent } from './components/appointment-form/appointment-form.component';



@NgModule({
  declarations: [
    AppointmentListComponent,
    AppointmentCalendarComponent,
    AppointmentFormComponent
  ],
  imports: [
    CommonModule
  ]
})
export class AppointmentsModule { }
