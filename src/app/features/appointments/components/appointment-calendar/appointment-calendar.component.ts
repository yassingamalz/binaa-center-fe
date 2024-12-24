// src/app/features/appointments/components/appointment-calendar/appointment-calendar.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgbCalendar, NgbDate, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { AppointmentService } from '../../services/appointment.service';
import { Subject, takeUntil } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppointmentFormComponent } from '../appointment-form/appointment-form.component';
import { ToastrService } from 'ngx-toastr';
import { AppointmentListDTO, AppointmentType, AppointmentStatus } from '../../../../core/models/appointment';

interface CalendarDay {
  date: NgbDate;
  appointments: AppointmentListDTO[];
  isToday: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'app-appointment-calendar',
  templateUrl: './appointment-calendar.component.html',
  styleUrls: ['./appointment-calendar.component.scss']
})
export class AppointmentCalendarComponent implements OnInit, OnDestroy {
  selectedDate: NgbDate;
  calendarDays: CalendarDay[][] = [];
  appointments: AppointmentListDTO[] = [];
  selectedDayAppointments: AppointmentListDTO[] = [];
  isLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private calendar: NgbCalendar,
    private appointmentService: AppointmentService,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {
    this.selectedDate = calendar.getToday();
  }

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading = true;
    const date = new Date(
      this.selectedDate.year,
      this.selectedDate.month - 1,
      this.selectedDate.day
    );

    this.appointmentService.getAllAppointments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (appointments) => {
          this.appointments = appointments;
          this.buildCalendar();
          this.updateSelectedDayAppointments();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading appointments:', error);
          this.toastr.error('حدث خطأ أثناء تحميل المواعيد');
          this.isLoading = false;
        }
      });
  }

  private buildCalendar(): void {
    const firstDayOfMonth = new Date(
      this.selectedDate.year,
      this.selectedDate.month - 1,
      1
    );
    const lastDayOfMonth = new Date(
      this.selectedDate.year,
      this.selectedDate.month,
      0
    );
  
    const days: CalendarDay[][] = [];
    let week: CalendarDay[] = [];
    const today = this.calendar.getToday();
  
    // Add leading empty days
    const firstDayOfWeek = firstDayOfMonth.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      week.push(this.createEmptyDay());
    }
  
    // Add days of the month
    for (let date = 1; date <= lastDayOfMonth.getDate(); date++) {
      const currentDate = new NgbDate(
        this.selectedDate.year,
        this.selectedDate.month,
        date
      );
      
      week.push(this.createDay(currentDate, today));
  
      if (week.length === 7) {
        days.push(week);
        week = [];
      }
    }
  
    // Add trailing empty days
    while (week.length > 0 && week.length < 7) {
      week.push(this.createEmptyDay());
    }
    if (week.length) {
      days.push(week);
    }
  
    this.calendarDays = days;
  }

  private createDay(date: NgbDate, today: NgbDate): CalendarDay {
    const dayAppointments = this.appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.dateTime);
      return appointmentDate.getDate() === date.day &&
        appointmentDate.getMonth() === date.month - 1 &&
        appointmentDate.getFullYear() === date.year;
    });

    return {
      date,
      appointments: dayAppointments,
      isToday: date.equals(today),
      isSelected: date.equals(this.selectedDate)
    };
  }

  private createEmptyDay(): CalendarDay {
    return {
      date: null as any,
      appointments: [],
      isToday: false,
      isSelected: false
    };
  }

  onDateSelect(day: CalendarDay): void {
    if (!day.date) return;

    this.selectedDate = day.date;
    this.updateSelectedDayAppointments();
  }

  private updateSelectedDayAppointments(): void {
    this.selectedDayAppointments = this.appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.dateTime);
      return appointmentDate.getDate() === this.selectedDate.day &&
        appointmentDate.getMonth() === this.selectedDate.month - 1 &&
        appointmentDate.getFullYear() === this.selectedDate.year;
    });
  }

  onMonthChange(event: NgbDateStruct): void {
    this.selectedDate = new NgbDate(event.year, event.month, 1);
    this.loadAppointments();
  }

  createAppointment(): void {
    const modalRef = this.modalService.open(AppointmentFormComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadAppointments();
          this.toastr.success('تم إنشاء الموعد بنجاح');
        }
      },
      () => { } // Modal dismissed
    );
  }

  previousMonth(): void {
    const previous = this.calendar.getPrev(this.selectedDate);
    this.selectedDate = new NgbDate(previous.year, previous.month, 1);
    this.loadAppointments();
  }

  nextMonth(): void {
    let newYear = this.selectedDate.year;
    let newMonth = this.selectedDate.month + 1;
    
    if (newMonth > 12) {
      newYear++;
      newMonth = 1;
    }
  
    this.selectedDate = new NgbDate(newYear, newMonth, 1);
    this.loadAppointments();
  }

  getFormattedDate(): Date {
    return new Date(
      this.selectedDate.year,
      this.selectedDate.month - 1,
      this.selectedDate.day
    );
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