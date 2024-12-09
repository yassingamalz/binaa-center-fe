import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { AppointmentService } from '../../appointments/services/appointment.service';
import { AssessmentService } from '../../assessments/services/assessment.service';
import { CaseService } from '../../cases/services/case.service';
import { SessionService } from '../../sessions/services/session.service';
import { FinanceService } from '../../finance/services/finance.service';
import { AssessmentStatus } from '../../../core/models/assessment';
import { AppointmentStatus } from '../../../core/models/appointment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(
    private caseService: CaseService,
    private sessionService: SessionService,
    private financeService: FinanceService,
    private appointmentService: AppointmentService,
    private assessmentService: AssessmentService
  ) {}

  getDashboardStats(): Observable<any> {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    return forkJoin({
      activeCases: this.caseService.getAllActiveCases(),
      todaysSessions: this.sessionService.getSessionStats(today, today),
      upcomingAssessments: this.assessmentService.getAssessmentsByStatus(AssessmentStatus.SCHEDULED),
      monthlyFinance: this.financeService.getFinancialSummary(firstDayOfMonth, today),
      upcomingAppointments: this.appointmentService.getAppointmentsByStatus(AppointmentStatus.SCHEDULED)
    });
  }

  getSessionsOverview(): Observable<any> {
    const startDate = new Date();
    startDate.setDate(1);
    const endDate = new Date();

    return this.sessionService.getSessionStats(startDate, endDate);
  }

  getRecentActivities(): Observable<any> {
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 7);

    return forkJoin({
      sessions: this.sessionService.getSessionStats(recentDate, new Date()),
      appointments: this.appointmentService.getAppointmentsByDateTime(recentDate),
      assessments: this.assessmentService.getAssessmentsByStatus(AssessmentStatus.COMPLETED)
    }).pipe(
      map(({ sessions, appointments, assessments }) => {
        const activities = [
          ...appointments.map(a => ({
            type: 'appointment',
            date: a.dateTime,
            details: a
          })),
          ...assessments.map(a => ({
            type: 'assessment',
            date: a.assessmentDate,
            details: a
          }))
        ];

        return activities
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 10);
      })
    );
  }

  getFinancialOverview(): Observable<any> {
    const startDate = new Date();
    startDate.setDate(1);
    const endDate = new Date();

    return this.financeService.getFinancialSummary(startDate, endDate);
  }
}