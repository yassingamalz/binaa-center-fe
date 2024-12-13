import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SessionService } from '../../services/session.service';
import { ToastrService } from 'ngx-toastr';
import { SessionResponseDTO, SessionType, AttendanceStatus } from '../../../../core/models/session';

@Component({
  selector: 'app-session-form',
  templateUrl: './session-form.component.html',
  styleUrls: ['./session-form.component.scss']
})
export class SessionFormComponent implements OnInit {
  @Input() session?: SessionResponseDTO;
  
  sessionForm: FormGroup;
  isSubmitting = false;

  sessionTypes = [
    { value: SessionType.INDIVIDUAL, label: 'فردي' },
    { value: SessionType.GROUP, label: 'جماعي' }
  ];

  attendanceStatuses = [
    { value: AttendanceStatus.PRESENT, label: 'حضر' },
    { value: AttendanceStatus.ABSENT, label: 'غائب' }
  ];

  constructor(
    private fb: FormBuilder,
    private activeModal: NgbActiveModal,
    private sessionService: SessionService,
    private toastr: ToastrService
  ) {
    this.sessionForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.session) {
      this.sessionForm.patchValue(this.session);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      caseId: ['', Validators.required],
      staffId: ['', Validators.required],
      purpose: ['', Validators.required],
      sessionDate: ['', Validators.required],
      sessionType: [SessionType.INDIVIDUAL, Validators.required],
      attendanceStatus: [AttendanceStatus.PRESENT, Validators.required],
      duration: [60, [Validators.required, Validators.min(15), Validators.max(240)]],
      notes: [''],
      goalsAchieved: [''],
      nextSessionPlan: ['']
    });
  }

  onSubmit(): void {
    if (this.sessionForm.invalid) {
      Object.keys(this.sessionForm.controls).forEach(key => {
        const control = this.sessionForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.isSubmitting = true;
    const sessionData = this.sessionForm.value;

    const operation = this.session 
      ? this.sessionService.updateSession(this.session.sessionId, sessionData)
      : this.sessionService.createSession(sessionData);

    operation.subscribe({
      next: (result) => {
        this.toastr.success(
          this.session ? 'تم تحديث الجلسة بنجاح' : 'تم إنشاء الجلسة بنجاح'
        );
        this.activeModal.close(result);
      },
      error: (error) => {
        console.error('Error saving session:', error);
        this.toastr.error('حدث خطأ أثناء حفظ الجلسة');
        this.isSubmitting = false;
      }
    });
  }

  dismiss(): void {
    this.activeModal.dismiss();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.sessionForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  getFieldError(fieldName: string): string {
    const control = this.sessionForm.get(fieldName);
    if (control?.errors) {
      if (control.errors['required']) return 'هذا الحقل مطلوب';
      if (control.errors['min']) return 'القيمة أقل من المسموح';
      if (control.errors['max']) return 'القيمة أكبر من المسموح';
    }
    return '';
  }
}