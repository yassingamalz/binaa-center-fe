// src/app/shared/payments/components/payment-form/payment-form.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { PaymentDTO, PaymentMethod, PaymentStatus } from '../../../../core/models/payment';
import { FinanceService } from '../../../../features/finance/services/finance.service';

@Component({
  selector: 'app-payment-form',
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss']
})
export class PaymentFormComponent implements OnInit {
  @Input() caseId!: number;
  @Input() payment?: PaymentDTO;

  paymentForm: FormGroup;
  isSubmitting = false;

  paymentMethods = [
    { value: PaymentMethod.CASH, label: 'نقدي' },
    { value: PaymentMethod.CARD, label: 'بطاقة' },
    { value: PaymentMethod.BANK, label: 'تحويل بنكي' }
  ];

  paymentStatuses = [
    { value: PaymentStatus.PAID, label: 'مدفوع' },
    { value: PaymentStatus.PENDING, label: 'معلق' }
  ];

  constructor(
    private fb: FormBuilder,
    private activeModal: NgbActiveModal,
    private financeService: FinanceService,
    private toastr: ToastrService
  ) {
    this.paymentForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.payment) {
      this.paymentForm.patchValue(this.payment);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      amount: ['', [Validators.required, Validators.min(0)]],
      paymentMethod: [PaymentMethod.CASH, Validators.required],
      paymentDate: [new Date(), Validators.required],
      description: [''],
      status: [PaymentStatus.PAID, Validators.required],
      invoiceNumber: ['', Validators.required]
    });
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
      caseId: this.caseId
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

  // Helper methods for template
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