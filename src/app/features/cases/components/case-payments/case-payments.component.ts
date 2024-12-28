// src\app\features\cases\components\case-payments\case-payments.component.ts
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { PaymentDTO, PaymentStatus, PaymentMethod } from '../../../../core/models/payment';
import { PaymentFormComponent } from '../../../../shared/payments/components/payment-form/payment-form.component';
import { FinanceService } from '../../../finance/services/finance.service';

@Component({
  selector: 'app-case-payments',
  templateUrl: './case-payments.component.html',
  styleUrls: ['./case-payments.component.scss']
})
export class CasePaymentsComponent implements OnInit, OnDestroy {
  @Input() caseId!: number;

  // Data
  payments: PaymentDTO[] = [];
  filteredPayments: PaymentDTO[] = [];
  isLoading = false;

  // Filters
  searchTerm: string = '';
  selectedDate: string = '';
  selectedStatus: PaymentStatus | null = null;

  // Status Options for Filter
  paymentStatuses = [
    { 
      value: PaymentStatus.PAID, 
      label: 'مدفوع',
      icon: 'fas fa-check-circle'
    },
    { 
      value: PaymentStatus.PENDING, 
      label: 'معلق',
      icon: 'fas fa-clock'
    },
    { 
      value: PaymentStatus.OVERDUE, 
      label: 'متأخر',
      icon: 'fas fa-exclamation-circle'
    }
  ];

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
          this.applyFilters(); // Apply any existing filters
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading payments:', error);
          this.toastr.error('حدث خطأ أثناء تحميل المدفوعات');
          this.isLoading = false;
        }
      });
  }

  // Filter Methods
  onSearch(): void {
    this.applyFilters();
  }

  onDateFilter(): void {
    this.applyFilters();
  }

  filterByStatus(status: PaymentStatus): void {
    this.selectedStatus = this.selectedStatus === status ? null : status;
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.payments];

    // Search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(payment => 
        payment.invoiceNumber.toLowerCase().includes(searchLower) ||
        payment.description?.toLowerCase().includes(searchLower)
      );
    }

    // Date filter
    if (this.selectedDate) {
      const filterDate = new Date(this.selectedDate).setHours(0, 0, 0, 0);
      filtered = filtered.filter(payment => {
        const paymentDate = new Date(payment.paymentDate).setHours(0, 0, 0, 0);
        return paymentDate === filterDate;
      });
    }

    // Status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(payment => 
        payment.paymentStatus === this.selectedStatus
      );
    }

    this.filteredPayments = this.sortPayments(filtered);
  }

  private sortPayments(payments: PaymentDTO[]): PaymentDTO[] {
    return [...payments].sort((a, b) => 
      new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    );
  }

  // UI Helper Methods
  getStatusIcon(status: PaymentStatus): string {
    const icons = {
      [PaymentStatus.PAID]: 'fas fa-check-circle',
      [PaymentStatus.PENDING]: 'fas fa-clock',
      [PaymentStatus.OVERDUE]: 'fas fa-exclamation-circle'
    };
    return icons[status];
  }

  getPaymentMethodIcon(method: PaymentMethod): string {
    const icons = {
      [PaymentMethod.CASH]: 'fas fa-money-bill',
      [PaymentMethod.CARD]: 'fas fa-credit-card',
      [PaymentMethod.BANK]: 'fas fa-university'
    };
    return icons[method];
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

  // Calculations
  getTotalAmount(): number {
    return this.filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  }

  getPendingAmount(): number {
    return this.filteredPayments
      .filter(p => p.paymentStatus === PaymentStatus.PENDING)
      .reduce((sum, payment) => sum + payment.amount, 0);
  }

  getOverdueAmount(): number {
    return this.filteredPayments
      .filter(p => p.paymentStatus === PaymentStatus.OVERDUE)
      .reduce((sum, payment) => sum + payment.amount, 0);
  }

  // Action Methods
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

  async deletePayment(payment: PaymentDTO): Promise<void> {
    if (confirm('هل أنت متأكد من حذف هذه الدفعة؟')) {
      try {
        await this.financeService.deletePayment(payment.paymentId).toPromise();
        this.loadPayments();
        this.toastr.success('تم حذف الدفعة بنجاح');
      } catch (error) {
        console.error('Error deleting payment:', error);
        this.toastr.error('حدث خطأ أثناء حذف الدفعة');
      }
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