// src/app/features/finance/components/expense-form/expense-form.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FinanceService } from '../../services/finance.service';
import { ToastrService } from 'ngx-toastr';
import { ExpenseDTO, ExpenseCategory } from '../../../../core/models/expense';

@Component({
  selector: 'app-expense-form',
  templateUrl: './expense-form.component.html',
  styleUrls: ['./expense-form.component.scss']
})
export class ExpenseFormComponent implements OnInit {
  @Input() expense?: ExpenseDTO;
  
  expenseForm: FormGroup;
  isSubmitting = false;

  expenseCategories = [
    { value: ExpenseCategory.SALARY, label: 'الرواتب' },
    { value: ExpenseCategory.RENT, label: 'الإيجار' },
    { value: ExpenseCategory.UTILITIES, label: 'المرافق' },
    { value: ExpenseCategory.SUPPLIES, label: 'المستلزمات' },
    { value: ExpenseCategory.MARKETING, label: 'التسويق' },
    { value: ExpenseCategory.MAINTENANCE, label: 'الصيانة' },
    { value: ExpenseCategory.OTHER, label: 'أخرى' }
  ];

  paymentMethods = [
    { value: 'CASH', label: 'نقدي' },
    { value: 'CARD', label: 'بطاقة' },
    { value: 'BANK', label: 'تحويل بنكي' }
  ];

  constructor(
    private fb: FormBuilder,
    private activeModal: NgbActiveModal,
    private financeService: FinanceService,
    private toastr: ToastrService
  ) {
    this.expenseForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.expense) {
      this.expenseForm.patchValue(this.expense);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      category: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      date: ['', Validators.required],
      description: ['', Validators.required],
      paidBy: ['', Validators.required],
      paymentMethod: ['CASH', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.expenseForm.invalid) {
      Object.keys(this.expenseForm.controls).forEach(key => {
        const control = this.expenseForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.isSubmitting = true;
    const expenseData = this.expenseForm.value;

    const operation = this.expense
      ? this.financeService.updateExpense(this.expense.expenseId, expenseData)
      : this.financeService.createExpense(expenseData);

    operation.subscribe({
      next: (result) => {
        this.toastr.success(
          this.expense ? 'تم تحديث المصروف بنجاح' : 'تم إضافة المصروف بنجاح'
        );
        this.activeModal.close(result);
      },
      error: (error) => {
        console.error('Error saving expense:', error);
        this.toastr.error('حدث خطأ أثناء حفظ المصروف');
        this.isSubmitting = false;
      }
    });
  }

  dismiss(): void {
    this.activeModal.dismiss();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.expenseForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  getFieldError(fieldName: string): string {
    const control = this.expenseForm.get(fieldName);
    if (control?.errors) {
      if (control.errors['required']) return 'هذا الحقل مطلوب';
      if (control.errors['min']) return 'القيمة يجب أن تكون أكبر من صفر';
    }
    return '';
  }
}