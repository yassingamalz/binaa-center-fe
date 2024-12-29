// src/app/features/finance/components/payment-list/payment-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { FinanceService } from '../../services/finance.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { HttpResponse } from '@angular/common/http';
import { PaymentStatus, PaymentMethod, PaymentDTO, PaymentResponseDTO } from '../../../../core/models/payment';
import { PaymentFormComponent } from '../../../../shared/payments/components/payment-form/payment-form.component';

interface StatusOption {
  value: PaymentStatus | 'all';
  label: string;
}

interface MethodOption {
  value: PaymentMethod | 'all';
  label: string;
}

@Component({
  selector: 'app-payment-list',
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.scss']
})
export class PaymentListComponent implements OnInit, OnDestroy {
  payments: PaymentResponseDTO[] = [];
  filteredPayments: PaymentResponseDTO[] = [];
  isLoading = false;
  searchForm: FormGroup;
  
  selectedStatus: PaymentStatus | 'all' = 'all';
  selectedMethod: PaymentMethod | 'all' = 'all';
  
  paymentStatuses: StatusOption[] = [
    { value: 'all', label: 'الكل' },
    { value: PaymentStatus.PAID, label: 'مدفوع' },
    { value: PaymentStatus.PENDING, label: 'معلق' },
    { value: PaymentStatus.OVERDUE, label: 'متأخر' }
  ];

  paymentMethods: MethodOption[] = [
    { value: 'all', label: 'الكل' },
    { value: PaymentMethod.CASH, label: 'نقدي' },
    { value: PaymentMethod.CARD, label: 'بطاقة' },
    { value: PaymentMethod.BANK, label: 'تحويل بنكي' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private financeService: FinanceService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.searchForm = this.fb.group({
      searchTerm: ['']
    });
  }

  ngOnInit(): void {
    this.loadPayments();
    this.setupSearchListener();
  }

  private setupSearchListener(): void {
    this.searchForm.get('searchTerm')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.filterPayments();
      });
  }

  loadPayments(): void {
    this.isLoading = true;
    this.financeService.getAllPayments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (payments) => {
          this.payments = payments;
          this.filterPayments();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading payments:', error);
          this.toastr.error('حدث خطأ أثناء تحميل المدفوعات');
          this.isLoading = false;
        }
      });
  }

  filterPayments(): void {
    let filtered = [...this.payments];
    const searchTerm = this.searchForm.get('searchTerm')?.value?.toLowerCase();

    if (searchTerm) {
      filtered = filtered.filter(payment => 
        payment.invoiceNumber.toLowerCase().includes(searchTerm) ||
        payment.caseName.toLowerCase().includes(searchTerm)
      );
    }

    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(payment => payment.paymentStatus === this.selectedStatus);
    }

    if (this.selectedMethod !== 'all') {
      filtered = filtered.filter(payment => payment.paymentMethod === this.selectedMethod);
    }

    this.filteredPayments = filtered;
  }

  onStatusChange(status: PaymentStatus | 'all'): void {
    this.selectedStatus = status;
    this.filterPayments();
  }

  onMethodChange(method: PaymentMethod | 'all'): void {
    this.selectedMethod = method;
    this.filterPayments();
  }

  recordPayment(): void {
    const modalRef = this.modalService.open(PaymentFormComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadPayments();
          this.toastr.success('تم تسجيل الدفعة بنجاح');
        }
      },
      () => {} // Modal dismissed
    );
  }

  editPayment(payment: PaymentResponseDTO): void {
    const modalRef = this.modalService.open(PaymentFormComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    // Convert PaymentResponseDTO to PaymentDTO for the form
    const paymentDTO: PaymentDTO = {
      paymentId: payment.paymentId,
      caseId: payment.caseId,
      sessionId: payment.sessionId,
      amount: payment.amount,
      paymentDate: payment.paymentDate,
      paymentMethod: payment.paymentMethod,
      invoiceNumber: payment.invoiceNumber,
      paymentStatus: payment.paymentStatus
    };

    modalRef.componentInstance.payment = paymentDTO;

    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadPayments();
          this.toastr.success('تم تحديث الدفعة بنجاح');
        }
      },
      () => {} // Modal dismissed
    );
  }

  printReceipt(payment: PaymentResponseDTO): void {
    this.financeService.generateReceipt(payment.paymentId)
      .subscribe({
        next: (response: HttpResponse<Blob>) => {
          const blob = new Blob([response.body as Blob], { 
            type: response.headers.get('content-type') || 'application/pdf' 
          });
          
          const contentDisposition = response.headers.get('content-disposition');
          const filename = contentDisposition
            ? contentDisposition.split('filename=')[1].trim().replace(/"/g, '')
            : `receipt-${payment.invoiceNumber}.pdf`;

          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('Error generating receipt:', error);
          this.toastr.error('حدث خطأ أثناء إنشاء الإيصال');
        }
      });
  }

  getStatusClass(status: PaymentStatus): string {
    return status.toLowerCase();
  }

  getMethodIcon(method: PaymentMethod): string {
    const icons: Record<PaymentMethod, string> = {
      [PaymentMethod.CASH]: 'fas fa-money-bill-wave',
      [PaymentMethod.CARD]: 'fas fa-credit-card',
      [PaymentMethod.BANK]: 'fas fa-university'
    };
    return icons[method];
  }

  getMethodLabel(method: PaymentMethod): string {
    const found = this.paymentMethods.find(m => m.value === method);
    return found ? found.label : '';
  }

  getStatusLabel(status: PaymentStatus): string {
    const found = this.paymentStatuses.find(s => s.value === status);
    return found ? found.label : '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}