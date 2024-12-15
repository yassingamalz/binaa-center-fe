// src/app/features/reports/components/financial-reports/financial-reports.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

type DateRangeType = 'week' | 'month' | 'quarter' | 'year';
type FinancialReportType = 'income' | 'expenses' | 'profit' | 'outstanding';

@Component({
  selector: 'app-financial-reports',
  templateUrl: './financial-reports.component.html',
  styleUrls: ['./financial-reports.component.scss']
})
export class FinancialReportsComponent implements OnInit, OnDestroy {
  filtersForm: FormGroup;
  isLoading = false;

  activeReport: FinancialReportType = 'income';
  dateRange: DateRangeType = 'month';

  dateRanges: { value: DateRangeType; label: string }[] = [
    { value: 'week', label: 'أسبوع' },
    { value: 'month', label: 'شهر' },
    { value: 'quarter', label: 'ربع سنوي' },
    { value: 'year', label: 'سنة' }
  ];

  reportTypes: { value: FinancialReportType; label: string; icon: string }[] = [
    { value: 'income', label: 'تقارير الدخل', icon: 'fas fa-money-bill-wave' },
    { value: 'expenses', label: 'تقارير المصروفات', icon: 'fas fa-file-invoice-dollar' },
    { value: 'profit', label: 'تقارير الأرباح', icon: 'fas fa-chart-line' },
    { value: 'outstanding', label: 'المدفوعات المعلقة', icon: 'fas fa-clock' }
  ];

  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder) {
    this.filtersForm = this.createForm();
  }

  ngOnInit(): void {
    this.setupFormListener();
    this.loadReportData();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      startDate: [''],
      endDate: [''],
      paymentMethod: ['all'],
      category: ['all'],
      showVoid: [false]
    });
  }

  private setupFormListener(): void {
    this.filtersForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadReportData();
      });
  }

  private loadReportData(): void {
    this.isLoading = true;
    // Implement data loading logic
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  switchReport(type: FinancialReportType): void {
    this.activeReport = type;
    this.loadReportData();
  }

  changeDateRange(range: DateRangeType): void {
    this.dateRange = range;
    this.loadReportData();
  }

  downloadReport(): void {
    // Implement report download logic
    console.log('Downloading financial report...');
  }

  printReport(): void {
    window.print();
  }

  exportToExcel(): void {
    // Implement Excel export logic
    console.log('Exporting to Excel...');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
