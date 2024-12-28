// src/app/features/reports/pages/case-reports/case-reports.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportService } from '../../services/report.service';
import { CaseService } from '../../../cases/services/case.service';
import { ToastrService } from 'ngx-toastr';
import { Subject, finalize, takeUntil } from 'rxjs';
import { CaseDTO } from '../../../../core/models/case';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-case-reports',
  templateUrl: './case-reports.component.html',
  styleUrls: ['./case-reports.component.scss']
})
export class CaseReportsComponent implements OnInit, OnDestroy {
  filtersForm: FormGroup;
  cases: CaseDTO[] = [];
  isLoading = false;
  selectedReportType: 'registration' | 'activity' | 'financial' = 'registration';

  // Computed properties
  get selectedCase(): CaseDTO | null {
    const caseId = this.filtersForm.get('caseId')?.value;
    return this.cases.find(c => c.caseId === caseId) || null;
  }

  get reportTypeName(): string {
    switch (this.selectedReportType) {
      case 'registration': return 'نموذج التسجيل';
      case 'activity': return 'تقرير النشاطات';
      case 'financial': return 'التقرير المالي';
      default: return 'غير محدد';
    }
  }

  get currentDate(): string {
    return new Date().toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  get expectedPageCount(): string {
    switch (this.selectedReportType) {
      case 'registration': return '3-4 صفحات';
      case 'activity': return '5-6 صفحات';
      case 'financial': return '2-3 صفحات';
      default: return '-';
    }
  }

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService,
    private caseService: CaseService,
    private toastr: ToastrService
  ) {
    this.filtersForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadCases();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      caseId: [null, Validators.required]
    });
  }

  private loadCases(): void {
    this.caseService.getAllActiveCases()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cases) => {
          this.cases = cases;
        },
        error: (error) => {
          console.error('Error loading cases:', error);
          this.toastr.error('حدث خطأ أثناء تحميل الحالات');
        }
      });
  }

  selectReportType(type: 'registration' | 'activity' | 'financial'): void {
    this.selectedReportType = type;
  }

  generateReport(): void {
    if (this.filtersForm.invalid) {
      Object.keys(this.filtersForm.controls).forEach(key => {
        const control = this.filtersForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.isLoading = true;
    const caseId = this.filtersForm.get('caseId')?.value;

    switch (this.selectedReportType) {
      case 'registration':
        this.generateRegistrationForm(caseId);
        break;
      case 'activity':
        this.generateActivityReport(caseId);
        break;
      case 'financial':
        this.generateFinancialReport(caseId);
        break;
    }
  }

  private generateRegistrationForm(caseId: number): void {
    this.reportService.generateRegistrationForm(caseId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response) => {
          this.downloadReport(response);
        },
        error: (error) => {
          console.error('Error generating form:', error);
          this.toastr.error('حدث خطأ أثناء إنشاء النموذج');
        }
      });
  }

  private generateActivityReport(caseId: number): void {
    // Implement activity report generation
    this.toastr.warning('تقرير النشاطات قيد التطوير');
    this.isLoading = false;
  }

  private generateFinancialReport(caseId: number): void {
    // Implement financial report generation
    this.toastr.warning('التقرير المالي قيد التطوير');
    this.isLoading = false;
  }

  private downloadReport(response: any): void {
    // Get filename from headers
    const contentDisposition = response.headers.get('content-disposition');
    let filename = 'report.pdf';
    if (contentDisposition) {
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }

    // Download the file
    const blob = response.body;
    if (blob) {
      saveAs(blob, filename);
      this.toastr.success('تم إنشاء التقرير بنجاح');
    } else {
      this.toastr.error('حدث خطأ أثناء تحميل الملف');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}