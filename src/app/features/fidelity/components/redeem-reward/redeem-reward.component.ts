// src\app\features\fidelity\components\redeem-reward\redeem-reward.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FidelityService } from '../../services/fidelity.service';
import { ToastrService } from 'ngx-toastr';
import { RewardDTO } from '../../../../core/models/fidelity-point';

@Component({
  selector: 'app-redeem-reward',
  templateUrl: './redeem-reward.component.html',
  styleUrls: ['./redeem-reward.component.scss']
})
export class RedeemRewardComponent implements OnInit {
  @Input() reward!: RewardDTO;
  
  redeemForm: FormGroup;
  isSubmitting = false;
  availablePoints = 0;

  constructor(
    private fb: FormBuilder,
    private activeModal: NgbActiveModal,
    private fidelityService: FidelityService,
    private toastr: ToastrService
  ) {
    this.redeemForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadAvailablePoints();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      caseId: ['', Validators.required],
      notes: ['']
    });
  }

  private loadAvailablePoints(): void {
    const caseId = this.redeemForm.get('caseId')?.value;
    if (!caseId) return;

    this.fidelityService.getPointsBalance(caseId).subscribe({
      next: (points) => {
        this.availablePoints = points;
      },
      error: (error) => {
        console.error('Error loading points:', error);
        this.toastr.error('حدث خطأ أثناء تحميل رصيد النقاط');
      }
    });
  }

  onSubmit(): void {
    if (this.redeemForm.invalid) {
      Object.keys(this.redeemForm.controls).forEach(key => {
        const control = this.redeemForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    if (this.availablePoints < this.reward.pointsRequired) {
      this.toastr.error('عدد النقاط غير كافي');
      return;
    }

    this.isSubmitting = true;
    const redeemData = {
      ...this.redeemForm.value,
      rewardId: this.reward.rewardId
    };

    this.fidelityService.redeemReward(redeemData).subscribe({
      next: (result) => {
        this.activeModal.close(result);
      },
      error: (error) => {
        console.error('Error redeeming reward:', error);
        this.toastr.error('حدث خطأ أثناء استبدال المكافأة');
        this.isSubmitting = false;
      }
    });
  }

  onCaseSelect(): void {
    this.loadAvailablePoints();
  }

  dismiss(): void {
    this.activeModal.dismiss();
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.redeemForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  getFieldError(fieldName: string): string {
    const control = this.redeemForm.get(fieldName);
    if (control?.errors) {
      if (control.errors['required']) return 'هذا الحقل مطلوب';
    }
    return '';
  }
}