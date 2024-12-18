// src/app/features/reports/services/report.service.ts
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiService } from "../../../core/services/api.service";
import { ReportDTO, ReportType } from "../../../core/models/report";
import { HttpResponse } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private endpoint = 'reports';

  constructor(private apiService: ApiService) {}

  createReport(data: Omit<ReportDTO, 'reportId'>): Observable<ReportDTO> {
    return this.apiService.post<ReportDTO>(this.endpoint, data);
  }

  getReportById(id: number): Observable<ReportDTO> {
    return this.apiService.get<ReportDTO>(`${this.endpoint}/${id}`);
  }

  getReportsByCase(caseId: number): Observable<ReportDTO[]> {
    return this.apiService.get<ReportDTO[]>(`${this.endpoint}/case/${caseId}`);
  }

  updateReport(id: number, data: Partial<ReportDTO>): Observable<ReportDTO> {
    return this.apiService.put<ReportDTO>(`${this.endpoint}/${id}`, data);
  }

  deleteReport(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  generateRegistrationForm(caseId: number): Observable<HttpResponse<Blob>> {
    return this.apiService.getBlob(`${this.endpoint}/cases/${caseId}/registration-form`);
  }

  generateReport(request: {
    caseId: number;
    type: ReportType;
    dateRange?: { startDate: Date; endDate: Date };
    metadata?: any;
  }): Observable<ReportDTO> {
    return this.apiService.post<ReportDTO>(`${this.endpoint}/generate`, request);
  }

  downloadReport(reportId: number): Observable<HttpResponse<Blob>> {
    return this.apiService.get(`${this.endpoint}/${reportId}/download`, {});
  }

  getReportsByDateRange(caseId: number, startDate: Date, endDate: Date): Observable<ReportDTO[]> {
    const params = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
    return this.apiService.get<ReportDTO[]>(`${this.endpoint}/case/${caseId}/date-range`, params);
  }

  getReportsByType(caseId: number, type: ReportType): Observable<ReportDTO[]> {
    return this.apiService.get<ReportDTO[]>(`${this.endpoint}/case/${caseId}/type/${type}`);
  }

  printReport(reportId: number): Observable<HttpResponse<Blob>> {
    return this.apiService.getBlob(`${this.endpoint}/${reportId}/print`);
  }

  batchGenerateReports(request: {
    caseIds: number[];
    type: ReportType;
    dateRange?: { startDate: Date; endDate: Date };
    metadata?: any;
  }): Observable<ReportDTO[]> {
    return this.apiService.post<ReportDTO[]>(`${this.endpoint}/batch-generate`, request);
  }

  getReportTemplate(type: ReportType): Observable<any> {
    return this.apiService.get(`${this.endpoint}/templates/${type}`);
  }

  getRecentReports(limit: number = 10): Observable<ReportDTO[]> {
    return this.apiService.get<ReportDTO[]>(`${this.endpoint}/recent`, { limit });
  }
}