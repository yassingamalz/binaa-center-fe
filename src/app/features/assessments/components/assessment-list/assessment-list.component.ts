// assessment-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AssessmentService } from '../../services/assessment.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { AssessmentFormComponent } from '../assessment-form/assessment-form.component';
import { AssessmentResponseDTO, AssessmentType, AssessmentStatus } from '../../../../core/models/assessment';

interface AssessmentTypeOption {
  value: AssessmentType | 'all';
  label: string;
}

interface AssessmentStatusOption {
  value: AssessmentStatus | 'all';
  label: string;
}

@Component({
  selector: 'app-assessment-list',
  templateUrl: './assessment-list.component.html',
  styleUrls: ['./assessment-list.component.scss']
})
export class AssessmentListComponent implements OnInit, OnDestroy {
  assessments: AssessmentResponseDTO[] = [];
  filteredAssessments: AssessmentResponseDTO[] = [];
  isLoading = false;
  searchForm: FormGroup;
  
  selectedType: AssessmentType | 'all' = 'all';
  selectedStatus: AssessmentStatus | 'all' = 'all';
  
  assessmentTypes: AssessmentTypeOption[] = [
    { value: 'all', label: 'الكل' },
    { value: AssessmentType.IQ, label: 'تقييم الذكاء' },
    { value: AssessmentType.PSYCHOLOGICAL, label: 'تقييم نفسي' },
    { value: AssessmentType.LEARNING_DIFFICULTIES, label: 'تقييم صعوبات التعلم' }
  ];

  assessmentStatuses: AssessmentStatusOption[] = [
    { value: 'all', label: 'الكل' },
    { value: AssessmentStatus.COMPLETED, label: 'مكتمل' },
    { value: AssessmentStatus.PENDING, label: 'قيد الإنتظار' },
    { value: AssessmentStatus.SCHEDULED, label: 'مجدول' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private assessmentService: AssessmentService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.searchForm = this.fb.group({
      searchTerm: ['']
    });
  }

  ngOnInit(): void {
    this.loadAssessments();
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
        this.filterAssessments();
      });
  }

  loadAssessments(): void {
    this.isLoading = true;
    this.assessmentService.getAllAssessments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (assessments) => {
          this.assessments = assessments;
          this.filterAssessments();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading assessments:', error);
          this.toastr.error('حدث خطأ أثناء تحميل التقييمات');
          this.isLoading = false;
        }
      });
  }

  filterAssessments(): void {
    let filtered = [...this.assessments];
    const searchTerm = this.searchForm.get('searchTerm')?.value?.toLowerCase();

    if (searchTerm) {
      filtered = filtered.filter(assessment => 
        assessment.caseName?.toLowerCase().includes(searchTerm) ||
        assessment.assessorName?.toLowerCase().includes(searchTerm)
      );
    }

    if (this.selectedType !== 'all') {
      filtered = filtered.filter(assessment => assessment.assessmentType === this.selectedType);
    }

    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(assessment => assessment.status === this.selectedStatus);
    }

    this.filteredAssessments = filtered;
  }

  onTypeChange(type: AssessmentType | 'all'): void {
    this.selectedType = type;
    this.filterAssessments();
  }

  onStatusChange(status: AssessmentStatus | 'all'): void {
    this.selectedStatus = status;
    this.filterAssessments();
  }

  createAssessment(): void {
    const modalRef = this.modalService.open(AssessmentFormComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadAssessments();
          this.toastr.success('تم إنشاء التقييم بنجاح');
        }
      },
      () => {} // Modal dismissed
    );
  }

  editAssessment(assessment: AssessmentResponseDTO): void {
    const modalRef = this.modalService.open(AssessmentFormComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.componentInstance.assessment = assessment;

    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadAssessments();
          this.toastr.success('تم تحديث التقييم بنجاح');
        }
      },
      () => {} // Modal dismissed
    );
  }

  deleteAssessment(assessment: AssessmentResponseDTO): void {
    if (confirm('هل أنت متأكد من حذف هذا التقييم؟')) {
      this.assessmentService.deleteAssessment(assessment.assessmentId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadAssessments();
            this.toastr.success('تم حذف التقييم بنجاح');
          },
          error: (error) => {
            console.error('Error deleting assessment:', error);
            this.toastr.error('حدث خطأ أثناء حذف التقييم');
          }
        });
    }
  }

  downloadReport(assessment: AssessmentResponseDTO): void {
    this.assessmentService.downloadReport(assessment.assessmentId)
      .subscribe({
        next: (success) => {
          if (success) {
            this.toastr.success('تم تحميل التقرير بنجاح');
          } else {
            this.toastr.error('فشل تحميل التقرير');
          }
        },
        error: (error) => {
          console.error('Error downloading report:', error);
          this.toastr.error('حدث خطأ أثناء تحميل التقرير');
        }
      });
  }

  getStatusClass(status: AssessmentStatus): string {
    return status.toLowerCase();
  }

  getTypeLabel(assessmentType: AssessmentType): string {
    const type = this.assessmentTypes.find(t => t.value === assessmentType);
    return type?.label || '';
  }
  
  getStatusLabel(status: AssessmentStatus): string {
    const statusOption = this.assessmentStatuses.find(s => s.value === status);
    return statusOption?.label || '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}