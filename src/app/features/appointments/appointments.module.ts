import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppointmentListComponent } from './components/appointment-list/appointment-list.component';
import { AppointmentCalendarComponent } from './components/appointment-calendar/appointment-calendar.component';
import { AppointmentFormComponent } from './components/appointment-form/appointment-form.component';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: AppointmentListComponent
  },
  {
    path: 'calendar',
    component: AppointmentCalendarComponent
  }
];

@NgModule({
  declarations: [
    AppointmentListComponent,
    AppointmentCalendarComponent,
    AppointmentFormComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    SharedModule
  ],
  exports: [
    AppointmentListComponent,
    AppointmentCalendarComponent,
    AppointmentFormComponent
  ]
})
export class AppointmentsModule { }