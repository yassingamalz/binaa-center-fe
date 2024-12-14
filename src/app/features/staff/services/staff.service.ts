import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { StaffDTO } from "../../../core/models/staff";
import { ApiService } from "../../../core/services/api.service";

@Injectable({
  providedIn: 'root'
})
export class StaffService {
  private endpoint = 'staff';

  constructor(private apiService: ApiService) {}

  createStaff(data: Omit<StaffDTO, 'staffId'>): Observable<StaffDTO> {
    return this.apiService.post<StaffDTO>(this.endpoint, data);
  }

  getStaffById(id: number): Observable<StaffDTO> {
    return this.apiService.get<StaffDTO>(`${this.endpoint}/${id}`);
  }

  getAllStaff(): Observable<StaffDTO[]> {
    return this.apiService.get<StaffDTO[]>(this.endpoint);
  }

  getStaff(): Observable<StaffDTO[]> {
    return this.apiService.get<StaffDTO[]>(`${this.endpoint}/lookup/staff`);
  }

  getStaffByRole(role: string): Observable<StaffDTO[]> {
    return this.apiService.get<StaffDTO[]>(`${this.endpoint}/role/${role}`);
  }

  updateStaff(id: number, data: Partial<StaffDTO>): Observable<StaffDTO> {
    return this.apiService.put<StaffDTO>(`${this.endpoint}/${id}`, data);
  }

  deleteStaff(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }
}