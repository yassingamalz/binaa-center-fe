// src\app\features\cases\components\case-payments\case-payments.component.ts
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { PaymentDTO, PaymentStatus, PaymentMethod } from '../../../../core/models/payment';
import { FinanceService } from '../../../finance/services/finance.service';
import { PaymentFormComponent } from '../../../../shared/payments/components/payment-form/payment-form.component';

@Component({
  selector: 'app-case-payments',
  templateUrl: './case-payments.component.html',
  styleUrls: ['./case-payments.component.scss']
})
export class CasePaymentsComponent implements OnInit, OnDestroy {
  @Input() caseId!: number;

  payments: PaymentDTO[] = [];
  isLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private financeService: FinanceService,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.isLoading = true;

    this.financeService.getPaymentsByCase(this.caseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (payments) => {
          this.payments = this.sortPayments(payments);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading payments:', error);
          this.toastr.error('حدث خطأ أثناء تحميل المدفوعات');
          this.isLoading = false;
        }
      });
  }

  private sortPayments(payments: PaymentDTO[]): PaymentDTO[] {
    return [...payments].sort((a, b) => 
      new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    );
  }

  getTotalAmount(): number {
    return this.payments.reduce((sum, payment) => sum + payment.amount, 0);
  }

  getPendingAmount(): number {
    return this.payments
      .filter(p => p.paymentStatus === PaymentStatus.PENDING)
      .reduce((sum, payment) => sum + payment.amount, 0);
  }

  getOverdueAmount(): number {
    return this.payments
      .filter(p => p.paymentStatus === PaymentStatus.OVERDUE)
      .reduce((sum, payment) => sum + payment.amount, 0);
  }

  getPaymentMethodLabel(method: PaymentMethod): string {
    const labels = {
      [PaymentMethod.CASH]: 'نقدي',
      [PaymentMethod.CARD]: 'بطاقة',
      [PaymentMethod.BANK]: 'تحويل بنكي'
    };
    return labels[method];
  }

  getStatusLabel(status: PaymentStatus): string {
    const labels = {
      [PaymentStatus.PAID]: 'مدفوع',
      [PaymentStatus.PENDING]: 'معلق',
      [PaymentStatus.OVERDUE]: 'متأخر'
    };
    return labels[status];
  }

  async addPayment(): Promise<void> {
    try {
      const modalRef = this.modalService.open(PaymentFormComponent, {
        size: 'lg',
        backdrop: 'static'
      });
      
      modalRef.componentInstance.caseId = this.caseId;

      const result = await modalRef.result;
      if (result) {
        this.loadPayments();
        this.toastr.success('تم تسجيل الدفعة بنجاح');
      }
    } catch (error) {
      // Modal dismissed
    }
  }

  async editPayment(payment: PaymentDTO): Promise<void> {
    try {
      const modalRef = this.modalService.open(PaymentFormComponent, {
        size: 'lg',
        backdrop: 'static'
      });
      
      modalRef.componentInstance.caseId = this.caseId;
      modalRef.componentInstance.payment = payment;

      const result = await modalRef.result;
      if (result) {
        this.loadPayments();
        this.toastr.success('تم تحديث الدفعة بنجاح');
      }
    } catch (error) {
      // Modal dismissed
    }
  }

  async printReceipt(payment: PaymentDTO): Promise<void> {
    try {
      await this.financeService.generateReceipt(payment.paymentId);
      this.toastr.success('تم طباعة الإيصال بنجاح');
    } catch (error) {
      console.error('Error printing receipt:', error);
      this.toastr.error('حدث خطأ أثناء طباعة الإيصال');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
