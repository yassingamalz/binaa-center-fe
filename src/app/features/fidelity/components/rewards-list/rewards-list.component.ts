// src\app\features\fidelity\components\rewards-list\rewards-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { FidelityService } from '../../services/fidelity.service';
import { RewardFormComponent } from '../reward-form/reward-form.component';
import { RedeemRewardComponent } from '../redeem-reward/redeem-reward.component';
import { RewardDTO, RewardStatus } from '../../../../core/models/fidelity-point';
@Component({
  selector: 'app-rewards-list',
  templateUrl: './rewards-list.component.html',
  styleUrls: ['./rewards-list.component.scss']
})
export class RewardsListComponent implements OnInit, OnDestroy {
  rewards: RewardDTO[] = [];
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fidelityService: FidelityService,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadRewards();
  }

  loadRewards(): void {
    this.isLoading = true;
    this.fidelityService.getActiveRewards()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (rewards) => {
          this.rewards = rewards;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading rewards:', error);
          this.toastr.error('حدث خطأ أثناء تحميل المكافآت');
          this.isLoading = false;
        }
      });
  }

  createReward(): void {
    const modalRef = this.modalService.open(RewardFormComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadRewards();
          this.toastr.success('تم إضافة المكافأة بنجاح');
        }
      },
      () => {} // Modal dismissed
    );
  }

  editReward(reward: RewardDTO): void {
    const modalRef = this.modalService.open(RewardFormComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.componentInstance.reward = reward;

    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadRewards();
          this.toastr.success('تم تحديث المكافأة بنجاح');
        }
      },
      () => {} // Modal dismissed
    );
  }

  deactivateReward(reward: RewardDTO): void {
    if (confirm('هل أنت متأكد من إلغاء تفعيل هذه المكافأة؟')) {
      this.fidelityService.updateReward(reward.rewardId, { status: RewardStatus.INACTIVE })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadRewards();
            this.toastr.success('تم إلغاء تفعيل المكافأة بنجاح');
          },
          error: (error) => {
            console.error('Error deactivating reward:', error);
            this.toastr.error('حدث خطأ أثناء إلغاء تفعيل المكافأة');
          }
        });
    }
  }

  redeemReward(reward: RewardDTO): void {
    const modalRef = this.modalService.open(RedeemRewardComponent, {
      size: 'md',
      backdrop: 'static'
    });

    modalRef.componentInstance.reward = reward;

    modalRef.result.then(
      (result) => {
        if (result) {
          this.toastr.success('تم استبدال المكافأة بنجاح');
        }
      },
      () => {} // Modal dismissed
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}