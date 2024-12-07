import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardStatsComponent } from './components/dashboard-stats/dashboard-stats.component';
import { RecentActivitiesComponent } from './components/recent-activities/recent-activities.component';
import { UpcomingAppointmentsComponent } from './components/upcoming-appointments/upcoming-appointments.component';



@NgModule({
  declarations: [
    DashboardStatsComponent,
    RecentActivitiesComponent,
    UpcomingAppointmentsComponent
  ],
  imports: [
    CommonModule
  ]
})
export class DashboardModule { }
