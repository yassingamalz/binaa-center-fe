import { NgModule } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { RecentActivitiesComponent } from './components/recent-activities/recent-activities.component';
import { StatsCardsComponent } from './components/stats-cards/stats-cards.component';
import { MonthlyIncomeChartComponent } from './components/monthly-income-chart/monthly-income-chart.component';
import { SessionOverviewComponent } from './components/session-overview/session-overview.component';
import { ActiveCasesChartComponent } from './components/active-cases-chart/active-cases-chart.component';
import { UpcomingSessionsComponent } from './components/upcoming-sessions/upcoming-sessions.component';
import { QuickActionsComponent } from './components/quick-actions/quick-actions.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { SharedModule } from '../../shared/shared.module';
import { StatCardComponent } from './components/stat-card/stat-card.component';


const routes = [
  {
    path: '',
    component: DashboardComponent
  }
];

@NgModule({
  declarations: [
    RecentActivitiesComponent,
    StatsCardsComponent,
    MonthlyIncomeChartComponent,
    SessionOverviewComponent,
    ActiveCasesChartComponent,
    UpcomingSessionsComponent,
    QuickActionsComponent,
    DashboardComponent,
    StatCardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    NgbModule,
    ReactiveFormsModule,
    NgxChartsModule,
    SharedModule
  ],
  providers: [
    DatePipe,
    DecimalPipe,
  ],
})
export class DashboardModule { }
