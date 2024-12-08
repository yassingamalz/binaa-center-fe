import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AssessmentDTO, AssessmentStatus } from "../../../core/models/assessment";
import { ApiService } from "../../../core/services/api.service";

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {
  private endpoint = 'assessments';

  constructor(private apiService: ApiService) {}

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
}