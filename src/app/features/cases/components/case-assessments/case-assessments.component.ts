// case-assessments.component.ts
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { AssessmentDTO, AssessmentType, AssessmentStatus } from '../../../../core/models/assessment';
import { AssessmentFormComponent } from '../../../assessments/components/assessment-form/assessment-form.component';
import { AssessmentService } from '../../../assessments/services/assessment.service';

@Component({
  selector: 'app-case-assessments',
  templateUrl: './case-assessments.component.html',
  styleUrls: ['./case-assessments.component.scss']
})
export class CaseAssessmentsComponent implements OnInit, OnDestroy {
  @Input() caseId!: number;

  assessments: AssessmentDTO[] = [];
  isLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private assessmentService: AssessmentService,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadAssessments();
  }

  loadAssessments(): void {
    this.isLoading = true;

    this.assessmentService.getAssessmentsByCase(this.caseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (assessments) => {
          this.assessments = this.sortAssessments(assessments);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading assessments:', error);
          this.toastr.error('حدث خطأ أثناء تحميل التقييمات');
          this.isLoading = false;
        }
      });
  }

  private sortAssessments(assessments: AssessmentDTO[]): AssessmentDTO[] {
    return [...assessments].sort((a, b) => 
      new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime()
    );
  }

  getAssessmentTypeLabel(type: AssessmentType): string {
    const labels = {
      [AssessmentType.IQ]: 'تقييم الذكاء',
      [AssessmentType.PSYCHOLOGICAL]: 'تقييم نفسي',
      [AssessmentType.LEARNING_DIFFICULTIES]: 'تقييم صعوبات التعلم'
    };
    return labels[type];
  }

  getStatusLabel(status: AssessmentStatus): string {
    const labels = {
      [AssessmentStatus.COMPLETED]: 'مكتمل',
      [AssessmentStatus.PENDING]: 'قيد الإنتظار',
      [AssessmentStatus.SCHEDULED]: 'مجدول'
    };
    return labels[status];
  }

  async addAssessment(): Promise<void> {
    try {
      const modalRef = this.modalService.open(AssessmentFormComponent, {
        size: 'lg',
        backdrop: 'static'
      });
      
      modalRef.componentInstance.caseId = this.caseId;

      const result = await modalRef.result;
      if (result) {
        this.loadAssessments();
        this.toastr.success('تم إضافة التقييم بنجاح');
      }
    } catch (error) {
      // Modal dismissed
    }
  }

  async editAssessment(assessment: AssessmentDTO): Promise<void> {
    try {
      const modalRef = this.modalService.open(AssessmentFormComponent, {
        size: 'lg',
        backdrop: 'static'
      });
      
      modalRef.componentInstance.caseId = this.caseId;
      modalRef.componentInstance.assessment = assessment;

      const result = await modalRef.result;
      if (result) {
        this.loadAssessments();
        this.toastr.success('تم تحديث التقييم بنجاح');
      }
    } catch (error) {
      // Modal dismissed
    }
  }

  async downloadReport(assessment: AssessmentDTO): Promise<void> {
    try {
      await this.assessmentService.downloadReport(assessment.assessmentId);
      this.toastr.success('تم تحميل التقرير بنجاح');
    } catch (error) {
      console.error('Error downloading report:', error);
      this.toastr.error('حدث خطأ أثناء تحميل التقرير');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
