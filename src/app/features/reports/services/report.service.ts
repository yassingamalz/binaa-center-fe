import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiService } from "../../../core/services/api.service";
import { ReportDTO } from "../../../core/models/report";

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
}