import { Injectable } from "@angular/core";
import { Observable, from } from "rxjs";
import { AssessmentDTO, AssessmentStatus } from "../../../core/models/assessment";
import { ApiService } from "../../../core/services/api.service";
import { HttpResponse } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {
  private endpoint = 'assessments';

  constructor(private apiService: ApiService) {}

  downloadReport(assessmentId: number): Observable<boolean> {
    return from(this.handleDownload(assessmentId));
  }

  createAssessment(data: Omit<AssessmentDTO, 'assessmentId'>): Observable<AssessmentDTO> {
    return this.apiService.post<AssessmentDTO>(this.endpoint, data);
  }

  getAssessmentById(id: number): Observable<AssessmentDTO> {
    return this.apiService.get<AssessmentDTO>(`${this.endpoint}/${id}`);
  }

  getAssessmentsByCase(caseId: number): Observable<AssessmentDTO[]> {
    return this.apiService.get<AssessmentDTO[]>(`${this.endpoint}/case/${caseId}`);
  }

  getAssessmentsByStatus(status: AssessmentStatus): Observable<AssessmentDTO[]> {
    return this.apiService.get<AssessmentDTO[]>(`${this.endpoint}/status/${status}`);
  }

  updateAssessment(id: number, data: Partial<AssessmentDTO>): Observable<AssessmentDTO> {
    return this.apiService.put<AssessmentDTO>(`${this.endpoint}/${id}`, data);
  }

  deleteAssessment(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }


  private async handleDownload(assessmentId: number): Promise<boolean> {
    try {
      const response = await this.apiService
        .getBlob(`${this.endpoint}/${assessmentId}/report`)
        .toPromise();

      if (response && response.body) {
        // Get filename from the headers or use default
        const contentDisposition = response.headers.get('content-disposition');
        const filename = contentDisposition
          ? contentDisposition.split('filename=')[1].trim().replace(/"/g, '')
          : `assessment-${assessmentId}-report.pdf`;

        // Create blob and download
        const blob = new Blob([response.body], { 
          type: response.headers.get('content-type') || 'application/pdf' 
        });
        
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
      }
      return false;
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }
}