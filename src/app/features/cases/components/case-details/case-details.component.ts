// src/app/features/cases/components/case-details/case-details.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { first, map, Subject, takeUntil } from 'rxjs';
import { CaseService } from '../../services/case.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CaseFormComponent } from '../case-form/case-form.component';
import { ToastrService } from 'ngx-toastr';
import { CaseDTO, CaseStatus } from '../../../../core/models/case';
import { trigger, transition, style, animate } from '@angular/animations';
import { SessionService } from '../../../sessions/services/session.service';
import { FinanceService } from '../../../finance/services/finance.service';
import { AssessmentService } from '../../../assessments/services/assessment.service';

interface TabDefinition {
  id: string;
  label: string;
  icon: string;
  count?: number;
}

@Component({
  selector: 'app-case-details',
  templateUrl: './case-details.component.html',
  styleUrls: ['./case-details.component.scss'],
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class CaseDetailsComponent implements OnInit, OnDestroy {
  case?: CaseDTO;
  isLoading = true;
  activeTab: string;
  
  tabs: TabDefinition[] = [
    { id: 'info', label: 'المعلومات الأساسية', icon: 'fas fa-info-circle' },
    { id: 'sessions', label: 'الجلسات', icon: 'fas fa-calendar-check', count: 0 },
    { id: 'assessments', label: 'التقييمات', icon: 'fas fa-clipboard-list', count: 0 },
    { id: 'payments', label: 'المدفوعات', icon: 'fas fa-money-bill-wave', count: 0 }
  ];
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private caseService: CaseService,
    private sessionService: SessionService,
    private financeService: FinanceService,
    private assessmentService: AssessmentService,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {
    this.activeTab = this.route.snapshot.queryParams['tab'] || 'info';
  }

  ngOnInit(): void {
    this.loadCaseDetails();
  }

  private async loadCaseDetails(): Promise<void> {
    const caseId = this.route.snapshot.params['id'];
    this.isLoading = true;

    try {
      this.case = await this.caseService.getCaseById(caseId).toPromise();
      await this.loadTabCounts(caseId);
      this.isLoading = false;
    } catch (error) {
      console.error('Error loading case:', error);
      this.toastr.error('حدث خطأ أثناء تحميل بيانات الحالة');
      this.router.navigate(['/cases']);
    }
  }

  private async loadTabCounts(caseId: number): Promise<void> {
    try {
      const [sessionsCount, assessmentsCount, paymentsCount] = await Promise.all([
        this.sessionService.getSessionsByCase(caseId).pipe(
          map(sessions => sessions.length),
          first()
        ).toPromise(),
        this.assessmentService.getAssessmentsByCase(caseId).pipe(
          map(assessments => assessments.length),
          first()
        ).toPromise(),
        this.financeService.getPaymentsByCase(caseId).pipe(
          map(payments => payments.length),
          first()
        ).toPromise()
      ]);
  
      this.tabs = this.tabs.map(tab => {
        switch (tab.id) {
          case 'sessions':
            return { ...tab, count: sessionsCount };
          case 'assessments':
            return { ...tab, count: assessmentsCount };
          case 'payments':
            return { ...tab, count: paymentsCount };
          default:
            return tab;
        }
      });
    } catch (error) {
      console.error('Error loading tab counts:', error);
    }
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
    if (!this.case) return;

    const modalRef = this.modalService.open(CaseFormComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      windowClass: 'modal-center'
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

  async toggleCaseStatus(): Promise<void> {
    if (!this.case) return;

    const newStatus = this.case.status === CaseStatus.ACTIVE 
      ? CaseStatus.INACTIVE 
      : CaseStatus.ACTIVE;

    const confirmMessage = newStatus === CaseStatus.INACTIVE
      ? 'هل أنت متأكد من إيقاف هذه الحالة؟'
      : 'هل تريد إعادة تنشيط هذه الحالة؟';

    if (confirm(confirmMessage)) {
      try {
        await this.caseService.updateCase(this.case.caseId, { status: newStatus }).toPromise();
        this.case.status = newStatus;
        const message = newStatus === CaseStatus.ACTIVE
          ? 'تم تنشيط الحالة بنجاح'
          : 'تم إيقاف الحالة بنجاح';
        this.toastr.success(message);
      } catch (error) {
        console.error('Error updating case status:', error);
        this.toastr.error('حدث خطأ أثناء تحديث حالة الملف');
      }
    }
  }

  editMedicalInfo(): void {
    if (!this.case) return;
    // Implement medical info editing modal
  }

  editEducationalInfo(): void {
    if (!this.case) return;
    // Implement educational info editing modal
  }

  editInsuranceInfo(): void {
    if (!this.case) return;
    // Implement insurance info editing modal
  }

  shareCase(): void {
    // Implement case sharing functionality
    this.toastr.info('قريباً - مشاركة بيانات الحالة');
  }

  printCase(): void {
    window.print();
  }

  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} يوم`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} شهر`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} سنة`;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}