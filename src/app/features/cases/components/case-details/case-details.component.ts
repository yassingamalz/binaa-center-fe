// case-details.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CaseService } from '../../services/case.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CaseFormComponent } from '../case-form/case-form.component';
import { ToastrService } from 'ngx-toastr';
import { CaseDTO, CaseStatus } from '../../../../core/models/case';

@Component({
  selector: 'app-case-details',
  templateUrl: './case-details.component.html',
  styleUrls: ['./case-details.component.scss']
})
export class CaseDetailsComponent implements OnInit, OnDestroy {
  case?: CaseDTO;
  isLoading = true;
  activeTab: string;
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private caseService: CaseService,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {
    // Get active tab from route or default to 'info'
    this.activeTab = this.route.snapshot.queryParams['tab'] || 'info';
  }

  ngOnInit(): void {
    this.loadCaseDetails();
  }

  private loadCaseDetails(): void {
    const caseId = this.route.snapshot.params['id'];
    this.isLoading = true;

    this.caseService.getCaseById(caseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (case_) => {
          this.case = case_;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading case:', error);
          this.toastr.error('حدث خطأ أثناء تحميل بيانات الحالة');
          this.router.navigate(['/cases']);
        }
      });
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
    // Update URL without navigation
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge'
    });
  }

  editCase(): void {
    const modalRef = this.modalService.open(CaseFormComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.componentInstance.case = this.case;

    modalRef.result.then(
      (result) => {
        if (result) {
          this.case = result;
          this.toastr.success('تم تحديث بيانات الحالة بنجاح');
        }
      },
      () => {} // Modal dismissed
    );
  }

  toggleCaseStatus(): void {
    if (!this.case) return;

    const newStatus = this.case.status === CaseStatus.ACTIVE 
      ? CaseStatus.INACTIVE 
      : CaseStatus.ACTIVE;

    this.caseService.updateCase(this.case.caseId, { status: newStatus })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          if (this.case) {
            this.case.status = newStatus;
            this.toastr.success('تم تحديث حالة الملف بنجاح');
          }
        },
        error: (error) => {
          console.error('Error updating case status:', error);
          this.toastr.error('حدث خطأ أثناء تحديث حالة الملف');
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
