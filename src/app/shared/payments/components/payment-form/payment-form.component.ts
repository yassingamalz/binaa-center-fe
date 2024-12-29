// src/app/shared/payments/components/payment-form/payment-form.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { PaymentDTO, PaymentMethod, PaymentStatus } from '../../../../core/models/payment';
import { FinanceService } from '../../../../features/finance/services/finance.service';
import { CaseService } from '../../../../features/cases/services/case.service';

@Component({
  selector: 'app-payment-form',
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss']
})
export class PaymentFormComponent implements OnInit {
  @Input() payment?: PaymentDTO;
  
  cases: any[] = [];
  isLoading = true;

  paymentForm: FormGroup;
  isSubmitting = false;

  paymentMethods = [
    { value: PaymentMethod.CASH, label: 'نقدي' },
    { value: PaymentMethod.CARD, label: 'بطاقة' },
    { value: PaymentMethod.BANK, label: 'تحويل بنكي' }
  ];

  paymentStatuses = [
    { value: PaymentStatus.PAID, label: 'مدفوع' },
    { value: PaymentStatus.PENDING, label: 'معلق' },
    { value: PaymentStatus.OVERDUE, label: 'متأخر' }
  ];

  constructor(
    private fb: FormBuilder,
    private activeModal: NgbActiveModal,
    private financeService: FinanceService,
    private caseService: CaseService,
    private toastr: ToastrService
  ) {
    this.paymentForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadCases();
  }

  private loadCases(): void {
    this.isLoading = true;
    this.caseService.getAllActiveCases().subscribe({
      next: (cases) => {
        this.cases = cases;
        
        if (this.payment) {
          this.patchPaymentForm();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading cases:', error);
        this.toastr.error('حدث خطأ أثناء تحميل الحالات');
        this.isLoading = false;
      }
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      caseId: [null, [Validators.required]],
      amount: ['', [Validators.required, Validators.min(0)]],
      paymentMethod: [PaymentMethod.CASH, Validators.required],
      paymentDate: [this.formatDateForInput(new Date()), Validators.required],
      description: [''],
      paymentStatus: [PaymentStatus.PAID, Validators.required],
    });
  }

  private formatDateForInput(date: Date): string {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  }

  private patchPaymentForm(): void {
    if (!this.payment) return;

    const formData = {
      ...this.payment,
      paymentDate: this.formatDateForInput(new Date(this.payment.paymentDate)),
      caseId: Number(this.payment.caseId)
    };

    this.paymentForm.patchValue(formData);
  }

  onSubmit(): void {
    if (this.paymentForm.invalid) {
      Object.keys(this.paymentForm.controls).forEach(key => {
        const control = this.paymentForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.isSubmitting = true;
    const paymentData = {
      ...this.paymentForm.value,
      paymentDate: new Date(this.paymentForm.value.paymentDate)
    };

    const operation = this.payment
      ? this.financeService.updatePayment(this.payment.paymentId, paymentData)
      : this.financeService.createPayment(paymentData);

    operation.subscribe({
      next: (result) => {
        this.toastr.success(
          this.payment ? 'تم تحديث الدفعة بنجاح' : 'تم تسجيل الدفعة بنجاح'
        );
        this.activeModal.close(result);
      },
      error: (error) => {
        console.error('Error saving payment:', error);
        this.toastr.error('حدث خطأ أثناء حفظ الدفعة');
        this.isSubmitting = false;
      }
    });
  }

  dismiss(): void {
    this.activeModal.dismiss();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.paymentForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  getFieldError(fieldName: string): string {
    const control = this.paymentForm.get(fieldName);
    if (control?.errors) {
      if (control.errors['required']) return 'هذا الحقل مطلوب';
      if (control.errors['min']) return 'القيمة يجب أن تكون أكبر من صفر';
    }
    return '';
  }
}