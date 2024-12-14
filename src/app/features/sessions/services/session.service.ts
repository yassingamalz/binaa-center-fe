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
    return this.apiService.get<SessionResponseDTO[]>(this.endpoint);
  }

  getSessionById(id: number): Observable<SessionResponseDTO> {
    return this.apiService.get<SessionResponseDTO>(`${this.endpoint}/${id}`);
  }

  createSession(data: Omit<SessionDTO, 'sessionId'>): Observable<SessionResponseDTO> {
    return this.apiService.post<SessionResponseDTO>(this.endpoint, data);
  }

  updateSession(id: number, data: Partial<SessionDTO>): Observable<SessionResponseDTO> {
    return this.apiService.put<SessionResponseDTO>(`${this.endpoint}/${id}`, data);
  }

  deleteSession(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  getSessionsByDateRange(startDate: Date, endDate: Date): Observable<SessionResponseDTO[]> {
    return this.apiService.get<SessionResponseDTO[]>(`${this.endpoint}/dateRange`, {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    });
  }

  getSessionsByCase(caseId: number): Observable<SessionResponseDTO[]> {
    return this.apiService.get<SessionResponseDTO[]>(`${this.endpoint}/case/${caseId}`);
  }

  getUpcomingSessions(): Observable<SessionResponseDTO[]> {
    return this.apiService.get<SessionResponseDTO[]>(`${this.endpoint}/upcoming`);
  }

  getSessionStats(startDate: Date, endDate: Date): Observable<{
    totalSessions: number;
    attendanceRate: number;
    byType: Record<SessionType, number>;
    cancelledSessions: number;
  }> {
    return this.apiService.get(`${this.endpoint}/stats`, {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    });
  }

  getSessionsByTherapist(staffId: number, date: Date): Observable<SessionResponseDTO[]> {
    return this.apiService.get<SessionResponseDTO[]>(
      `${this.endpoint}/staff/${staffId}/date/${date.toISOString()}`
    );
  }
}