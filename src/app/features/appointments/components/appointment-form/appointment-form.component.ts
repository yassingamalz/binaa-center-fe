// src/app/features/appointments/components/appointment-form/appointment-form.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AppointmentService } from '../../services/appointment.service';
import { ToastrService } from 'ngx-toastr';
import { CaseService } from '../../../cases/services/case.service';
import { StaffService } from '../../../staff/services/staff.service';
import { forkJoin } from 'rxjs';
import { AppointmentDTO, AppointmentType, AppointmentStatus } from '../../../../core/models/appointment';

@Component({
  selector: 'app-appointment-form',
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.scss']
})
export class AppointmentFormComponent implements OnInit {
  @Input() appointment?: AppointmentDTO;
  
  cases: any[] = [];
  staff: any[] = [];
  appointmentForm: FormGroup;
  isSubmitting = false;
  isLoading = true;

  readonly appointmentTypes = [
    { value: AppointmentType.ASSESSMENT, label: 'تقييم' },
    { value: AppointmentType.THERAPY, label: 'جلسة' },
    { value: AppointmentType.CONSULTATION, label: 'استشارة' }
  ];

  readonly appointmentStatuses = [
    { value: AppointmentStatus.SCHEDULED, label: 'مجدول' },
    { value: AppointmentStatus.COMPLETED, label: 'مكتمل' },
    { value: AppointmentStatus.CANCELLED, label: 'ملغي' }
  ];

  constructor(
    private fb: FormBuilder,
    private activeModal: NgbActiveModal,
    private caseService: CaseService,
    private appointmentService: AppointmentService,
    private staffService: StaffService,
    private toastr: ToastrService
  ) {
    this.appointmentForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadCasesAndStaff();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      caseId: [null, [Validators.required]],
      staffId: [null, [Validators.required]],
      dateTime: [this.formatDateForInput(new Date()), [Validators.required]],
      type: [AppointmentType.THERAPY, [Validators.required]],
      status: [AppointmentStatus.SCHEDULED, [Validators.required]],
      notes: ['']
    });
  }

  private loadCasesAndStaff(): void {
    this.isLoading = true;
    forkJoin({
      cases: this.caseService.getAllActiveCases(),
      staff: this.staffService.getAllStaff()
    }).subscribe({
      next: (result) => {
        this.cases = result.cases;
        this.staff = result.staff;
        
        if (this.appointment) {
          this.patchAppointmentForm();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.toastr.error('حدث خطأ أثناء تحميل البيانات');
        this.isLoading = false;
      }
    });
  }

  private patchAppointmentForm(): void {
    if (!this.appointment) return;

    const formData = {
      ...this.appointment,
      dateTime: this.formatDateForInput(new Date(this.appointment.dateTime)),
      caseId: Number(this.appointment.caseId),
      staffId: Number(this.appointment.staffId)
    };

    console.log('Patching form with:', formData); // Debug log
    this.appointmentForm.patchValue(formData);
  }

  private formatDateForInput(date: Date): string {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid) {
      Object.keys(this.appointmentForm.controls).forEach(key => {
        const control = this.appointmentForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.isSubmitting = true;
    const formData = {
      ...this.appointmentForm.value,
      dateTime: new Date(this.appointmentForm.value.dateTime)
    };

    const operation = this.appointment
      ? this.appointmentService.updateAppointment(this.appointment.appointmentId, formData)
      : this.appointmentService.createAppointment(formData);

    operation.subscribe({
      next: (result) => {
        this.toastr.success(
          this.appointment ? 'تم تحديث الموعد بنجاح' : 'تم إنشاء الموعد بنجاح'
        );
        this.activeModal.close(result);
      },
      error: (error) => {
        console.error('Error saving appointment:', error);
        this.toastr.error('حدث خطأ أثناء حفظ الموعد');
        this.isSubmitting = false;
      }
    });
  }

  dismiss(): void {
    this.activeModal.dismiss();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.appointmentForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  getFieldError(fieldName: string): string {
    const control = this.appointmentForm.get(fieldName);
    if (control?.errors) {
      if (control.errors['required']) return 'هذا الحقل مطلوب';
    }
    return '';
  }
}