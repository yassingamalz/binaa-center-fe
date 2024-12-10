// case-form.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CaseService } from '../../services/case.service';
import { ToastrService } from 'ngx-toastr';
import { CaseDTO, CaseStatus } from '../../../../core/models/case';

@Component({
  selector: 'app-case-form',
  templateUrl: './case-form.component.html',
  styleUrls: ['./case-form.component.scss']
})
export class CaseFormComponent implements OnInit {
  @Input() case?: CaseDTO;
  
  caseForm: FormGroup;
  isLoading = false;
  isSubmitting = false;
  
  constructor(
    private fb: FormBuilder,
    private activeModal: NgbActiveModal,
    private caseService: CaseService,
    private toastr: ToastrService
  ) {
    this.caseForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.case) {
      this.caseForm.patchValue(this.case);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      age: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      guardianName: ['', [Validators.required]],
      contactNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]],
      specialNeeds: [''],
      emergencyContact: ['', [Validators.required]],
      medicalHistory: [''],
      currentMedications: [''],
      allergies: [''],
      schoolName: [''],
      gradeLevel: [''],
      primaryDiagnosis: [''],
      secondaryDiagnosis: [''],
      insuranceInfo: [''],
      status: [CaseStatus.ACTIVE]
    });
  }

  onSubmit(): void {
    if (this.caseForm.invalid) {
      Object.keys(this.caseForm.controls).forEach(key => {
        const control = this.caseForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.isSubmitting = true;
    const caseData = this.caseForm.value;

    const operation = this.case 
      ? this.caseService.updateCase(this.case.caseId, caseData)
      : this.caseService.createCase(caseData);

    operation.subscribe({
      next: (result) => {
        this.toastr.success(
          this.case ? 'تم تحديث الحالة بنجاح' : 'تم إضافة الحالة بنجاح'
        );
        this.activeModal.close(result);
      },
      error: (error) => {
        console.error('Error saving case:', error);
        this.toastr.error('حدث خطأ أثناء حفظ الحالة');
        this.isSubmitting = false;
      }
    });
  }

  dismiss(): void {
    this.activeModal.dismiss();
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.caseForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  getFieldError(fieldName: string): string {
    const control = this.caseForm.get(fieldName);
    if (control?.errors) {
      if (control.errors['required']) return 'هذا الحقل مطلوب';
      if (control.errors['minlength']) return 'هذا الحقل قصير جداً';
      if (control.errors['pattern']) return 'هذا الرقم غير صحيح';
      if (control.errors['min']) return 'القيمة أقل من المسموح';
      if (control.errors['max']) return 'القيمة أكبر من المسموح';
    }
    return '';
  }
}

