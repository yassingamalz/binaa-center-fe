import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiService } from "../../../core/services/api.service";
import { AppointmentDTO, AppointmentListDTO, AppointmentStatus } from "../../../core/models/appointment";

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private endpoint = 'appointments';

  constructor(private apiService: ApiService) {}

  createAppointment(data: Omit<AppointmentDTO, 'appointmentId'>): Observable<AppointmentDTO> {
    return this.apiService.post<AppointmentDTO>(this.endpoint, data);
  }

  getAppointmentsByDateTime(date: Date): Observable<AppointmentListDTO[]> {
    return this.apiService.get<AppointmentListDTO[]>(`${this.endpoint}/list/date/${date.toISOString()}`);
  }

  getAppointmentById(id: number): Observable<AppointmentDTO> {
    return this.apiService.get<AppointmentDTO>(`${this.endpoint}/${id}`);
  }

  getAppointmentsByStatus(status: AppointmentStatus): Observable<AppointmentDTO[]> {
    return this.apiService.get<AppointmentDTO[]>(`${this.endpoint}/status/${status}`);
  }

  updateAppointment(id: number, data: Partial<AppointmentDTO>): Observable<AppointmentDTO> {
    return this.apiService.put<AppointmentDTO>(`${this.endpoint}/${id}`, data);
  }

  deleteAppointment(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }
}