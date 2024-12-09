
// src/app/features/sessions/services/sessions.service.ts
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { SessionDTO, AttendanceStatus, SessionType } from '../../../core/models/session';
import { ApiService } from '../../../core/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private endpoint = 'sessions';

  constructor(private apiService: ApiService) {}

  getSessionsByDateRange(startDate: Date, endDate: Date): Observable<SessionDTO[]> {
    return this.apiService.get<SessionDTO[]>(`${this.endpoint}/dateRange`, {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    });
  }


  getUpcomingSessions(): Observable<SessionDTO[]> {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    return this.apiService.get<SessionDTO[]>(`${this.endpoint}/dateRange`, {
      start: today.toISOString(),
      end: nextWeek.toISOString()
    });
  }

  getSessionStats(startDate: Date, endDate: Date): Observable<any> {
    return this.apiService.get<SessionDTO[]>(`${this.endpoint}/dateRange`, {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    }).pipe(
      map(sessions => ({
        totalSessions: sessions.length,
        attendanceRate: this.calculateAttendanceRate(sessions),
        byType: this.groupSessionsByType(sessions),
        cancelledSessions: sessions.filter(s => s.attendanceStatus === AttendanceStatus.ABSENT).length
      }))
    );
  }

  getSessionsByTherapist(staffId: number, date: Date): Observable<SessionDTO[]> {
    return this.apiService.get<SessionDTO[]>(`${this.endpoint}/staff/${staffId}/date/${date.toISOString()}`);
  }

  private calculateAttendanceRate(sessions: SessionDTO[]): number {
    const attended = sessions.filter(s => s.attendanceStatus === AttendanceStatus.PRESENT).length;
    return (attended / sessions.length) * 100;
  }

  private groupSessionsByType(sessions: SessionDTO[]): Record<SessionType, number> {
    return sessions.reduce((acc, session) => ({
      ...acc,
      [session.sessionType]: (acc[session.sessionType] || 0) + 1
    }), {} as Record<SessionType, number>);
  }
}