import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiService } from "../../../core/services/api.service";
import { DocumentDTO } from "../../../core/models/document";

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private endpoint = 'documents';

  constructor(private apiService: ApiService) {}

  createDocument(data: Omit<DocumentDTO, 'documentId'>): Observable<DocumentDTO> {
    return this.apiService.post<DocumentDTO>(this.endpoint, data);
  }

  getDocumentById(id: number): Observable<DocumentDTO> {
    return this.apiService.get<DocumentDTO>(`${this.endpoint}/${id}`);
  }

  getDocumentsByCase(caseId: number): Observable<DocumentDTO[]> {
    return this.apiService.get<DocumentDTO[]>(`${this.endpoint}/case/${caseId}`);
  }

  getDocumentsByType(type: DocumentType): Observable<DocumentDTO[]> {
    return this.apiService.get<DocumentDTO[]>(`${this.endpoint}/type/${type}`);
  }

  updateDocument(id: number, data: Partial<DocumentDTO>): Observable<DocumentDTO> {
    return this.apiService.put<DocumentDTO>(`${this.endpoint}/${id}`, data);
  }

  deleteDocument(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }
}