// src/app/features/sessions/services/session.service.ts
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { SessionResponseDTO, SessionDTO, AttendanceStatus, SessionType } from '../../../core/models/session';
import { ApiService } from '../../../core/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private endpoint = 'sessions';

  constructor(private apiService: ApiService) {}

  getAllSessions(): Observable<SessionResponseDTO[]> {
    return this.apiService.get<SessionDTO[]>(this.endpoint)
      .pipe(
        map(sessions => this.mapToResponseDTOs(sessions))
      );
  }

  getSessionById(id: number): Observable<SessionResponseDTO> {
    return this.apiService.get<SessionDTO>(`${this.endpoint}/${id}`)
      .pipe(
        map(session => this.mapToResponseDTO(session))
      );
  }

  createSession(data: Omit<SessionDTO, 'sessionId'>): Observable<SessionResponseDTO> {
    return this.apiService.post<SessionDTO>(this.endpoint, data)
      .pipe(
        map(session => this.mapToResponseDTO(session))
      );
  }

  updateSession(id: number, data: Partial<SessionDTO>): Observable<SessionResponseDTO> {
    return this.apiService.put<SessionDTO>(`${this.endpoint}/${id}`, data)
      .pipe(
        map(session => this.mapToResponseDTO(session))
      );
  }

  deleteSession(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  getSessionsByDateRange(startDate: Date, endDate: Date): Observable<SessionResponseDTO[]> {
    return this.apiService.get<SessionDTO[]>(`${this.endpoint}/dateRange`, {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    }).pipe(
      map(sessions => this.mapToResponseDTOs(sessions))
    );
  }

  getSessionsByCase(caseId: number): Observable<SessionResponseDTO[]> {
    return this.apiService.get<SessionDTO[]>(`${this.endpoint}/case/${caseId}`)
      .pipe(
        map(sessions => this.mapToResponseDTOs(sessions))
      );
  }

  getUpcomingSessions(): Observable<SessionResponseDTO[]> {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    return this.getSessionsByDateRange(today, nextWeek);
  }

  getSessionStats(startDate: Date, endDate: Date): Observable<any> {
    return this.getSessionsByDateRange(startDate, endDate)
      .pipe(
        map(sessions => ({
          totalSessions: sessions.length,
          attendanceRate: this.calculateAttendanceRate(sessions),
          byType: this.groupSessionsByType(sessions),
          cancelledSessions: sessions.filter(s => 
            s.attendanceStatus === AttendanceStatus.ABSENT
          ).length
        }))
      );
  }

  getSessionsByTherapist(staffId: number, date: Date): Observable<SessionResponseDTO[]> {
    return this.apiService.get<SessionDTO[]>(
      `${this.endpoint}/staff/${staffId}/date/${date.toISOString()}`
    ).pipe(
      map(sessions => this.mapToResponseDTOs(sessions))
    );
  }

  private calculateAttendanceRate(sessions: SessionResponseDTO[]): number {
    const attended = sessions.filter(s => 
      s.attendanceStatus === AttendanceStatus.PRESENT
    ).length;
    return (attended / sessions.length) * 100;
  }

  private groupSessionsByType(sessions: SessionResponseDTO[]): Record<SessionType, number> {
    return sessions.reduce((acc, session) => ({
      ...acc,
      [session.sessionType]: (acc[session.sessionType] || 0) + 1
    }), {} as Record<SessionType, number>);
  }

  private mapToResponseDTO(session: SessionDTO): SessionResponseDTO {
    return {
      ...session,
      caseName: 'Case Name', // This should come from the backend
      staffName: 'Staff Name', // This should come from the backend
      sessionTime: new Date(session.sessionDate).toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      statusLabel: session.attendanceStatus === AttendanceStatus.PRESENT ? 'حضر' : 'غائب',
      typeLabel: session.sessionType === SessionType.INDIVIDUAL ? 'فردي' : 'جماعي'
    };
  }

  private mapToResponseDTOs(sessions: SessionDTO[]): SessionResponseDTO[] {
    return sessions.map(session => this.mapToResponseDTO(session));
  }
}