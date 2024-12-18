// src/app/features/reports/components/case-reports/case-reports.component.ts
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

  generateRegistrationForm(): void {
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

    this.reportService.generateRegistrationForm(caseId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response) => {
          // Get filename from headers
          const contentDisposition = response.headers.get('content-disposition');
          let filename = 'registration-form.pdf';
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
            this.toastr.success('تم إنشاء نموذج التسجيل بنجاح');
          } else {
            this.toastr.error('حدث خطأ أثناء تحميل الملف');
          }
        },
        error: (error) => {
          console.error('Error generating form:', error);
          this.toastr.error('حدث خطأ أثناء إنشاء النموذج');
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}