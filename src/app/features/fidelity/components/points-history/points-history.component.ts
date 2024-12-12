//src\app\features\fidelity\components\points-history\points-history.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { FidelityService } from '../../services/fidelity.service';
import { ToastrService } from 'ngx-toastr';
import { FidelityPointsDTO, PointsTransactionType } from '../../../../core/models/fidelity-point';

@Component({
  selector: 'app-points-history',
  templateUrl: './points-history.component.html',
  styleUrls: ['./points-history.component.scss']
})
export class PointsHistoryComponent implements OnInit, OnDestroy {
  pointsHistory: FidelityPointsDTO[] = [];
  statistics: any = {};
  isLoading = false;
  searchForm: FormGroup;

  private destroy$ = new Subject<void>();

  constructor(
    private fidelityService: FidelityService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.searchForm = this.fb.group({
      caseId: ['']
    });
  }

  ngOnInit(): void {
    this.loadStatistics();
    this.setupSearchListener();
  }

  private setupSearchListener(): void {
    this.searchForm.get('caseId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(caseId => {
        if (caseId) {
          this.loadPointsHistory(caseId);
          this.loadStatistics();
        } else {
          this.pointsHistory = [];
          this.loadStatistics();
        }
      });
  }

  loadPointsHistory(caseId: number): void {
    this.isLoading = true;

    this.fidelityService.getPointsHistory(caseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (history) => {
          this.pointsHistory = history;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading points history:', error);
          this.toastr.error('حدث خطأ أثناء تحميل سجل النقاط');
          this.isLoading = false;
        }
      });
  }

  loadStatistics(): void {
    const caseId = this.searchForm.get('caseId')?.value;
    
    this.fidelityService.getPointsStatistics(caseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.statistics = stats;
        },
        error: (error) => {
          console.error('Error loading statistics:', error);
          this.toastr.error('حدث خطأ أثناء تحميل الإحصائيات');
        }
      });
  }

  getTransactionLabel(type: PointsTransactionType): string {
    return type === PointsTransactionType.EARN ? 'إضافة نقاط' : 'استبدال نقاط';
  }

  getTransactionClass(type: PointsTransactionType): string {
    return type === PointsTransactionType.EARN ? 'earned' : 'redeemed';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

