import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SessionService } from '../../services/session.service';
import { CaseService } from '../../../cases/services/case.service';
import { StaffService } from '../../../staff/services/staff.service';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import { SessionResponseDTO, SessionType, AttendanceStatus } from '../../../../core/models/session';

@Component({
  selector: 'app-session-form',
  templateUrl: './session-form.component.html',
  styleUrls: ['./session-form.component.scss']
})
export class SessionFormComponent implements OnInit {
  @Input() session?: SessionResponseDTO;
  
  cases: any[] = [];
  staff: any[] = [];
  sessionForm: FormGroup;
  isSubmitting = false;
  isLoading = true;

  readonly sessionTypes = [
    { value: SessionType.INDIVIDUAL, label: 'فردي' },
    { value: SessionType.GROUP, label: 'جماعي' }
  ];

  readonly attendanceStatuses = [
    { value: AttendanceStatus.PRESENT, label: 'حضر' },
    { value: AttendanceStatus.ABSENT, label: 'غائب' }
  ];

  constructor(
    private fb: FormBuilder,
    private activeModal: NgbActiveModal,
    private sessionService: SessionService,
    private caseService: CaseService,
    private staffService: StaffService,
    private toastr: ToastrService
  ) {
    this.sessionForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadCasesAndStaff();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      caseId: [null, [Validators.required]],
      staffId: [null, [Validators.required]],
      purpose: ['', [Validators.required]],
      sessionDate: [this.formatDateForInput(new Date()), [Validators.required]],
      sessionType: [SessionType.INDIVIDUAL, [Validators.required]],
      attendanceStatus: [AttendanceStatus.PRESENT, [Validators.required]],
      duration: [60, [Validators.required, Validators.min(15), Validators.max(240)]],
      notes: [''],
      goalsAchieved: [''],
      nextSessionPlan: ['']
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
        
        if (this.session) {
          this.patchSessionForm();
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

  private patchSessionForm(): void {
    if (!this.session) return;

    const formData = {
      ...this.session,
      caseId: Number(this.session.caseId),
      staffId: Number(this.session.staffId),
      sessionDate: this.formatDateForInput(new Date(this.session.sessionDate))
    };

    console.log('Patching form with:', formData); // Debug log
    this.sessionForm.patchValue(formData);
  }

  private formatDateForInput(date: Date): string {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
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
    const formData = {
      ...this.sessionForm.value,
      sessionDate: new Date(this.sessionForm.value.sessionDate)
    };

    const operation = this.session 
      ? this.sessionService.updateSession(this.session.sessionId, formData)
      : this.sessionService.createSession(formData);

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