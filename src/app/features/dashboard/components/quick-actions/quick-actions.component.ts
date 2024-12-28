// src/app/features/dashboard/components/quick-actions/quick-actions.component.ts
import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { PaymentFormComponent } from '../../../../shared/payments/components/payment-form/payment-form.component';
import { CaseFormComponent } from '../../../cases/components/case-form/case-form.component';
import { SessionFormComponent } from '../../../sessions/components/session-form/session-form.component';

@Component({
  selector: 'app-quick-actions',
  templateUrl: './quick-actions.component.html',
  styleUrls: ['./quick-actions.component.scss']
})
export class QuickActionsComponent {
  constructor(
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {}

  addNewCase(): void {
    const modalRef = this.modalService.open(CaseFormComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.result.then(
      (result) => {
        if (result) {
          this.toastr.success('تم إضافة الحالة بنجاح');
        }
      },
      () => {} // Modal dismissed
    );
  }

  scheduleSession(): void {
    const modalRef = this.modalService.open(SessionFormComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.result.then(
      (result) => {
        if (result) {
          this.toastr.success('تم جدولة الجلسة بنجاح');
        }
      },
      () => {} // Modal dismissed
    );
  }

  recordPayment(): void {
    const modalRef = this.modalService.open(PaymentFormComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.result.then(
      (result) => {
        if (result) {
          this.toastr.success('تم تسجيل الدفعة بنجاح');
        }
      },
      () => {} // Modal dismissed
    );
  }

  createReport(): void {
  }
}
