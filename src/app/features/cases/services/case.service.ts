// src/app/features/cases/services/case.service.ts
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { SessionDTO, AttendanceStatus, SessionType } from '../../../core/models/session';
import { ApiService } from '../../../core/services/api.service';
import { CaseDTO } from '../../../core/models/case';

@Injectable({
  providedIn: 'root'
})@Injectable({
  providedIn: 'root'
})
export class CaseService {

  private endpoint = 'cases';

  constructor(private apiService: ApiService) {}

  getAllCases(): Observable<CaseDTO[]> {
    return this.apiService.get<CaseDTO[]>(this.endpoint);
  }

  getAllActiveCases(): Observable<CaseDTO[]> {
    return this.apiService.get<CaseDTO[]>(`${this.endpoint}/active`);
  }

  getCaseById(id: number): Observable<CaseDTO> {
    return this.apiService.get<CaseDTO>(`${this.endpoint}/${id}`);
  }

  getCases(): Observable<CaseDTO[]> {
    return this.apiService.get<CaseDTO[]>(`${this.endpoint}/lookup/cases`);
  }

  createCase(caseData: Omit<CaseDTO, 'caseId'>): Observable<CaseDTO> {
    return this.apiService.post<CaseDTO>(this.endpoint, caseData);
  }

  updateCase(id: number, caseData: Partial<CaseDTO>): Observable<CaseDTO> {
    return this.apiService.put<CaseDTO>(`${this.endpoint}/${id}`, caseData);
  }

  searchCases(query: string): Observable<CaseDTO[]> {
    return this.apiService.get<CaseDTO[]>(`${this.endpoint}/search`, { query });
  }
}