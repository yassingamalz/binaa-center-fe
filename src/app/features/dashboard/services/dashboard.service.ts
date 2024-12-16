// src/app/features/dashboard/services/dashboard.service.ts
import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { AppointmentService } from '../../appointments/services/appointment.service';
import { AssessmentService } from '../../assessments/services/assessment.service';
import { CaseService } from '../../cases/services/case.service';
import { SessionService } from '../../sessions/services/session.service';
import { FinanceService } from '../../finance/services/finance.service';
import { AssessmentStatus, AssessmentResponseDTO } from '../../../core/models/assessment';
import { AppointmentStatus, AppointmentDTO, AppointmentListDTO } from '../../../core/models/appointment';
import { CaseDTO } from '../../../core/models/case';
import { SessionType } from '../../../core/models/session';
import { PaymentDTO } from '../../../core/models/payment';
import { ExpenseDTO } from '../../../core/models/expense';

export interface DashboardStats {
  activeCases: CaseDTO[];
  todaysSessions: {
    totalSessions: number;
    attendanceRate: number;
    byType: Record<SessionType, number>;
    cancelledSessions: number;
  };
  upcomingAssessments: AssessmentResponseDTO[];
  monthlyFinance: FinancialSummary;
  upcomingAppointments: AppointmentDTO[];
}

export interface Activity {
  type: 'appointment' | 'assessment';
  date: Date;
  details: AppointmentListDTO | AssessmentResponseDTO;
}

export interface PaymentWithDate extends PaymentDTO {
  paymentDate: Date;
}

export interface ExpenseWithDate extends ExpenseDTO {
  date: Date;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  payments: PaymentWithDate[];
  expenses: ExpenseWithDate[];
}

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
  ) { }

  getDashboardStats(): Observable<DashboardStats> {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    return forkJoin({
      activeCases: this.caseService.getAllActiveCases(),
      todaysSessions: this.sessionService.getSessionStats(today, today),
      upcomingAssessments: this.assessmentService.getAssessmentsByStatus(AssessmentStatus.SCHEDULED),
      monthlyFinance: this.financeService.getFinancialSummary(firstDayOfMonth, today),
      upcomingAppointments: this.appointmentService.getAppointmentsByStatus(AppointmentStatus.SCHEDULED)
    }) as Observable<DashboardStats>;
  }

  getSessionsOverview(startDate?: Date, endDate?: Date): Observable<{
    totalSessions: number;
    attendanceRate: number;
    cancelledSessions: number;
    byType: Record<SessionType, number>;
  }> {
    const end = endDate || new Date();
    const start = startDate || new Date(end.getFullYear(), end.getMonth(), 1);

    return this.sessionService.getSessionStats(start, end);
  }

  getRecentActivities(): Observable<Activity[]> {
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 7);

    return forkJoin({
      appointments: this.appointmentService.getAppointmentsByDateTime(recentDate),
      assessments: this.assessmentService.getAssessmentsByStatus(AssessmentStatus.COMPLETED)
    }).pipe(
      map(({ appointments, assessments }) => {
        const activities: Activity[] = [
          ...appointments.map(appointment => ({
            type: 'appointment' as const,
            date: new Date(appointment.dateTime),
            details: appointment
          })),
          ...assessments.map(assessment => ({
            type: 'assessment' as const,
            date: new Date(assessment.assessmentDate),
            details: assessment
          }))
        ];

        return activities
          .sort((a: Activity, b: Activity) => b.date.getTime() - a.date.getTime())
          .slice(0, 10);
      })
    );
  }

  getFinancialOverview(startDate?: Date, endDate?: Date): Observable<FinancialSummary> {
    const end = endDate || new Date();
    const start = startDate || new Date(end.getFullYear(), end.getMonth(), 1);

    return this.financeService.getFinancialSummary(start, end)
      .pipe(
        map(data => ({
          ...data,
          payments: data.payments.map((payment: PaymentDTO): PaymentWithDate => ({
            ...payment,
            paymentDate: new Date(payment.paymentDate)
          })).sort((a: PaymentWithDate, b: PaymentWithDate) =>
            a.paymentDate.getTime() - b.paymentDate.getTime()
          ),
          expenses: data.expenses.map((expense: ExpenseDTO): ExpenseWithDate => ({
            ...expense,
            date: new Date(expense.date)
          })).sort((a: ExpenseWithDate, b: ExpenseWithDate) =>
            a.date.getTime() - b.date.getTime()
          )
        }))
      );
  }
}