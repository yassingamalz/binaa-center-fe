// src/app/features/reports/components/staff-reports/staff-reports.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

type DateRangeType = 'week' | 'month' | 'quarter' | 'year';
type StaffReportType = 'performance' | 'sessions' | 'attendance' | 'caseload';

@Component({
  selector: 'app-staff-reports',
  templateUrl: './staff-reports.component.html',
  styleUrls: ['./staff-reports.component.scss']
})
export class StaffReportsComponent implements OnInit, OnDestroy {
  filtersForm: FormGroup;
  isLoading = false;

  activeReport: StaffReportType = 'performance';
  dateRange: DateRangeType = 'month';

  dateRanges: { value: DateRangeType; label: string }[] = [
    { value: 'week', label: 'أسبوع' },
    { value: 'month', label: 'شهر' },
    { value: 'quarter', label: 'ربع سنوي' },
    { value: 'year', label: 'سنة' }
  ];

  reportTypes: { value: StaffReportType; label: string; icon: string }[] = [
    { value: 'performance', label: 'تقارير الأداء', icon: 'fas fa-chart-bar' },
    { value: 'sessions', label: 'تقارير الجلسات', icon: 'fas fa-calendar-check' },
    { value: 'attendance', label: 'تقارير الحضور', icon: 'fas fa-user-clock' },
    { value: 'caseload', label: 'الحالات المسندة', icon: 'fas fa-users' }
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
      staffId: [''],
      startDate: [''],
      endDate: [''],
      department: ['all'],
      includeInactive: [false]
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

  switchReport(type: StaffReportType): void {
    this.activeReport = type;
    this.loadReportData();
  }

  changeDateRange(range: DateRangeType): void {
    this.dateRange = range;
    this.loadReportData();
  }

  downloadReport(): void {
    // Implement report download logic
    console.log('Downloading staff report...');
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

