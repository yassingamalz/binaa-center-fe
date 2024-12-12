import { Injectable } from "@angular/core";
import { Observable, from } from "rxjs";
import { AssessmentResponseDTO, AssessmentStatus } from "../../../core/models/assessment";
import { ApiService } from "../../../core/services/api.service";
import { HttpResponse } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {
  private endpoint = 'assessments';

  constructor(private apiService: ApiService) {}

  getAllAssessments(): Observable<AssessmentResponseDTO[]> {
    return this.apiService.get<AssessmentResponseDTO[]>(this.endpoint);
  }

  downloadReport(assessmentId: number): Observable<boolean> {
    return from(this.handleDownload(assessmentId));
  }

  private async handleDownload(assessmentId: number): Promise<boolean> {
    try {
      const response = await this.apiService
        .getBlob(`${this.endpoint}/${assessmentId}/report`)
        .toPromise();

      if (!(response instanceof HttpResponse) || !response.body) {
        return false;
      }

      const blob = response.body; // This is already a Blob from getBlob()
      
      // Get filename from the headers or use default
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].trim().replace(/"/g, '')
        : `assessment-${assessmentId}-report.pdf`;
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }

  createAssessment(data: Omit<AssessmentResponseDTO, 'assessmentId'>): Observable<AssessmentResponseDTO> {
    return this.apiService.post<AssessmentResponseDTO>(this.endpoint, data);
  }

  getAssessmentById(id: number): Observable<AssessmentResponseDTO> {
    return this.apiService.get<AssessmentResponseDTO>(`${this.endpoint}/${id}`);
  }

  getAssessmentsByCase(caseId: number): Observable<AssessmentResponseDTO[]> {
    return this.apiService.get<AssessmentResponseDTO[]>(`${this.endpoint}/case/${caseId}`);
  }

  getAssessmentsByStatus(status: AssessmentStatus): Observable<AssessmentResponseDTO[]> {
    return this.apiService.get<AssessmentResponseDTO[]>(`${this.endpoint}/status/${status}`);
  }

  updateAssessment(id: number, data: Partial<AssessmentResponseDTO>): Observable<AssessmentResponseDTO> {
    return this.apiService.put<AssessmentResponseDTO>(`${this.endpoint}/${id}`, data);
  }

  deleteAssessment(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

}