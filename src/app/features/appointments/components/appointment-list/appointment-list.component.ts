import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppointmentFormComponent } from '../appointment-form/appointment-form.component';
import { AppointmentService } from '../../services/appointment.service';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { AppointmentListDTO, AppointmentStatus, AppointmentDTO, AppointmentType } from '../../../../core/models/appointment';

@Component({
  selector: 'app-appointment-list',
  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.scss']
})
export class AppointmentListComponent implements OnInit, OnDestroy {
  appointments: AppointmentListDTO[] = [];
  filteredAppointments: AppointmentListDTO[] = [];
  isLoading = true;
  
  // Filters
  selectedDate = new Date();
  selectedStatus: AppointmentStatus | 'all' = 'all';
  searchTerm = '';

  readonly statusOptions: Array<{value: AppointmentStatus | 'all', label: string}> = [
    { value: 'all' as const, label: 'الكل' },
    { value: AppointmentStatus.SCHEDULED, label: 'مجدول' },
    { value: AppointmentStatus.COMPLETED, label: 'مكتمل' },
    { value: AppointmentStatus.CANCELLED, label: 'ملغي' }
  ];
  
  private destroy$ = new Subject<void>();

  constructor(
    private appointmentService: AppointmentService,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading = true;
    this.appointmentService.getAppointmentsByDateTime(this.selectedDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (appointments) => {
          this.appointments = appointments;
          this.filterAppointments();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading appointments:', error);
          this.toastr.error('حدث خطأ أثناء تحميل المواعيد');
          this.isLoading = false;
        }
      });
  }

  filterAppointments(): void {
    let filtered = [...this.appointments];

    // Status filter
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(app => app.status === this.selectedStatus);
    }

    // Search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        app.caseName.toLowerCase().includes(term) ||
        app.staffName.toLowerCase().includes(term) ||
        app.type.toLowerCase().includes(term)
      );
    }

    this.filteredAppointments = filtered;
  }

  onDateChange(date: Date): void {
    this.selectedDate = date;
    this.loadAppointments();
  }

  onStatusChange(status: AppointmentStatus | 'all'): void {
    this.selectedStatus = status;
    this.filterAppointments();
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.filterAppointments();
  }

  createAppointment(): void {
    const modalRef = this.modalService.open(AppointmentFormComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.result.then(
      (result: AppointmentDTO) => {
        if (result) {
          this.loadAppointments();
          this.toastr.success('تم إنشاء الموعد بنجاح');
        }
      },
      () => {} // Modal dismissed
    );
  }

  editAppointment(appointment: AppointmentListDTO): void {
    const modalRef = this.modalService.open(AppointmentFormComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    // Convert to base DTO for form
    const appointmentData: AppointmentDTO = {
      appointmentId: appointment.appointmentId,
      caseId: appointment.caseId,
      staffId: appointment.staffId,
      dateTime: appointment.dateTime,
      status: appointment.status,
      type: appointment.type,
      notes: appointment.notes
    };

    modalRef.componentInstance.appointment = appointmentData;

    modalRef.result.then(
      (result: AppointmentDTO) => {
        if (result) {
          this.loadAppointments();
          this.toastr.success('تم تحديث الموعد بنجاح');
        }
      },
      () => {} // Modal dismissed
    );
  }

  cancelAppointment(appointment: AppointmentListDTO): void {
    if (confirm('هل أنت متأكد من إلغاء هذا الموعد؟')) {
      this.appointmentService.updateAppointment(
        appointment.appointmentId,
        { status: AppointmentStatus.CANCELLED }
      ).subscribe({
        next: () => {
          this.loadAppointments();
          this.toastr.success('تم إلغاء الموعد بنجاح');
        },
        error: (error) => {
          console.error('Error cancelling appointment:', error);
          this.toastr.error('حدث خطأ أثناء إلغاء الموعد');
        }
      });
    }
  }

  getTypeLabel(type: AppointmentType): string {
    const labels = {
      [AppointmentType.ASSESSMENT]: 'تقييم',
      [AppointmentType.THERAPY]: 'جلسة',
      [AppointmentType.CONSULTATION]: 'استشارة'
    };
    return labels[type];
  }

  getStatusLabel(status: AppointmentStatus): string {
    const labels = {
      [AppointmentStatus.SCHEDULED]: 'مجدول',
      [AppointmentStatus.COMPLETED]: 'مكتمل',
      [AppointmentStatus.CANCELLED]: 'ملغي'
    };
    return labels[status];
  }

  getStatusClass(status: AppointmentStatus): string {
    return status.toLowerCase();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}