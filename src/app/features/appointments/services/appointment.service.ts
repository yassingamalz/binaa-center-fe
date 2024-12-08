import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiService } from "../../../core/services/api.service";
import { AppointmentDTO, AppointmentStatus } from "../../../core/models/appointment";

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private endpoint = 'appointments';

  constructor(private apiService: ApiService) {}

  createAppointment(data: Omit<AppointmentDTO, 'appointmentId'>): Observable<AppointmentDTO> {
    return this.apiService.post<AppointmentDTO>(this.endpoint, data);
  }

  getAppointmentById(id: number): Observable<AppointmentDTO> {
    return this.apiService.get<AppointmentDTO>(`${this.endpoint}/${id}`);
  }

  getAppointmentsByDateTime(dateTime: Date): Observable<AppointmentDTO[]> {
    return this.apiService.get<AppointmentDTO[]>(`${this.endpoint}/datetime/${dateTime.toISOString()}`);
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