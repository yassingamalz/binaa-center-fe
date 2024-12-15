// src/app/features/reports/components/case-reports/case-reports.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

type DateRangeType = 'week' | 'month' | 'quarter' | 'year';
type ReportType = 'progress' | 'assessment' | 'attendance';

@Component({
 selector: 'app-case-reports',
 templateUrl: './case-reports.component.html',
 styleUrls: ['./case-reports.component.scss']
})
export class CaseReportsComponent implements OnInit, OnDestroy {
 filtersForm: FormGroup;
 isLoading = false;
 
 activeReport: ReportType = 'progress';
 dateRange: DateRangeType = 'month';
 
 dateRanges: { value: DateRangeType; label: string }[] = [
   { value: 'week', label: 'أسبوع' },
   { value: 'month', label: 'شهر' },
   { value: 'quarter', label: 'ربع سنوي' },
   { value: 'year', label: 'سنة' }
 ];

 reportTypes: { value: ReportType; label: string; icon: string }[] = [
   { value: 'progress', label: 'تقارير التقدم', icon: 'fas fa-chart-line' },
   { value: 'assessment', label: 'تقارير التقييم', icon: 'fas fa-clipboard-check' },
   { value: 'attendance', label: 'تقارير الحضور', icon: 'fas fa-user-check' }
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
     caseId: [''],
     reportType: ['progress'],
     startDate: [''],
     endDate: [''],
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

 switchReport(type: ReportType): void {
   this.activeReport = type;
   this.loadReportData();
 }

 changeDateRange(range: DateRangeType): void {
   this.dateRange = range;
   this.loadReportData();
 }

 downloadReport(): void {
   // Implement report download logic
   console.log('Downloading report...');
 }

 printReport(): void {
   window.print();
 }

 ngOnDestroy(): void {
   this.destroy$.next();
   this.destroy$.complete();
 }
}