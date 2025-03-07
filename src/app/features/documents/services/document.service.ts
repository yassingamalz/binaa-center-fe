
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DocumentDTO, DocumentResponseDTO } from '../../../core/models/document';
import { ApiService } from '../../../core/services/api.service';
import { HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private endpoint = 'documents';

  constructor(private apiService: ApiService) {}

  getAllDocuments(): Observable<DocumentResponseDTO[]> {
    return this.apiService.get<DocumentResponseDTO[]>(this.endpoint);
  }

  getDocumentById(id: number): Observable<DocumentResponseDTO> {
    return this.apiService.get<DocumentResponseDTO>(`${this.endpoint}/${id}`);
  }

  uploadDocument(formData: FormData): Observable<DocumentResponseDTO> {
    return this.apiService.post<DocumentResponseDTO>(`${this.endpoint}/upload`, formData);
  }

  downloadDocument(id: number): Observable<HttpResponse<Blob>> {
    return this.apiService.getBlob(`${this.endpoint}/download/${id}`);
  }

  updateDocument(id: number, data: Partial<DocumentResponseDTO>): Observable<DocumentResponseDTO> {
    return this.apiService.put<DocumentResponseDTO>(`${this.endpoint}/${id}`, data);
  }

  deleteDocument(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  getDocumentsByCase(caseId: number): Observable<DocumentResponseDTO[]> {
    return this.apiService.get<DocumentResponseDTO[]>(`${this.endpoint}/case/${caseId}`);
  }

  getDocumentsByType(type: string): Observable<DocumentResponseDTO[]> {
    return this.apiService.get<DocumentResponseDTO[]>(`${this.endpoint}/type/${type}`);
  }
}