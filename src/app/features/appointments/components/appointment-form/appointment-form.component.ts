// src/app/features/appointments/components/appointment-form/appointment-form.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AppointmentService } from '../../services/appointment.service';
import { ToastrService } from 'ngx-toastr';
import { AppointmentDTO, AppointmentType, AppointmentStatus } from '../../../../core/models/appointment';

@Component({
  selector: 'app-appointment-form',
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.scss']
})
export class AppointmentFormComponent implements OnInit {
  @Input() appointment?: AppointmentDTO;

  appointmentForm: FormGroup;
  isSubmitting = false;

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
    private appointmentService: AppointmentService,
    private toastr: ToastrService
  ) {
    this.appointmentForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.appointment) {
      // Convert datetime string to Date object for form
      const appointmentData = {
        ...this.appointment,
        dateTime: new Date(this.appointment.dateTime)
      };
      this.appointmentForm.patchValue(appointmentData);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      caseId: ['', [Validators.required]],
      staffId: ['', [Validators.required]],
      dateTime: [new Date(), [Validators.required]],
      type: [AppointmentType.THERAPY, [Validators.required]],
      status: [AppointmentStatus.SCHEDULED, [Validators.required]],
      notes: ['']
    });
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
    const appointmentData = this.appointmentForm.value;

    // Format date properly
    appointmentData.dateTime = new Date(appointmentData.dateTime);

    const operation = this.appointment
      ? this.appointmentService.updateAppointment(this.appointment.appointmentId, appointmentData)
      : this.appointmentService.createAppointment(appointmentData);

    operation.subscribe({
      next: (result) => {
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

  // Helper methods for template
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