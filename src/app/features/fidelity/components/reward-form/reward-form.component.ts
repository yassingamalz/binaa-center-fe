// src\app\features\fidelity\components\reward-form\reward-form.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FidelityService } from '../../services/fidelity.service';
import { ToastrService } from 'ngx-toastr';
import { RewardDTO, RewardStatus } from '../../../../core/models/fidelity-point';

@Component({
  selector: 'app-reward-form',
  templateUrl: './reward-form.component.html',
  styleUrls: ['./reward-form.component.scss']
})
export class RewardFormComponent implements OnInit {
  @Input() reward?: RewardDTO;
  
  rewardForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private activeModal: NgbActiveModal,
    private fidelityService: FidelityService,
    private toastr: ToastrService
  ) {
    this.rewardForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.reward) {
      this.rewardForm.patchValue(this.reward);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      pointsRequired: ['', [Validators.required, Validators.min(1)]],
      description: [''],
      validUntil: ['', Validators.required],
      status: [RewardStatus.ACTIVE]
    });
  }

  onSubmit(): void {
    if (this.rewardForm.invalid) {
      Object.keys(this.rewardForm.controls).forEach(key => {
        const control = this.rewardForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.isSubmitting = true;
    const rewardData = this.rewardForm.value;

    const operation = this.reward
      ? this.fidelityService.updateReward(this.reward.rewardId, rewardData)
      : this.fidelityService.createReward(rewardData);

    operation.subscribe({
      next: (result) => {
        this.activeModal.close(result);
      },
      error: (error) => {
        console.error('Error saving reward:', error);
        this.toastr.error('حدث خطأ أثناء حفظ المكافأة');
        this.isSubmitting = false;
      }
    });
  }

  dismiss(): void {
    this.activeModal.dismiss();
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.rewardForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  getFieldError(fieldName: string): string {
    const control = this.rewardForm.get(fieldName);
    if (control?.errors) {
      if (control.errors['required']) return 'هذا الحقل مطلوب';
      if (control.errors['minlength']) return 'هذا الحقل قصير جداً';
      if (control.errors['min']) return 'القيمة يجب أن تكون أكبر من صفر';
    }
    return '';
  }

  getMinDate(): string {
    const date = this.reward?.validUntil || new Date();
    return new Date(date).toISOString().split('T')[0];
  }
}
