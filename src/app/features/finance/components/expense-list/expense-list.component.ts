// src/app/features/finance/components/expense-list/expense-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { FinanceService } from '../../services/finance.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ExpenseCategory, ExpenseDTO } from '../../../../core/models/expense';
import { ExpenseFormComponent } from '../expense-form/expense-form.component';

interface CategoryOption {
  value: ExpenseCategory | 'all';
  label: string;
}

@Component({
  selector: 'app-expense-list',
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.scss']
})
export class ExpenseListComponent implements OnInit, OnDestroy {
  expenses: ExpenseDTO[] = [];
  filteredExpenses: ExpenseDTO[] = [];
  isLoading = false;
  searchForm: FormGroup;
  
  selectedCategory: ExpenseCategory | 'all' = 'all';
  
  expenseCategories: CategoryOption[] = [
    { value: 'all', label: 'الكل' },
    { value: ExpenseCategory.SALARY, label: 'الرواتب' },
    { value: ExpenseCategory.RENT, label: 'الإيجار' },
    { value: ExpenseCategory.UTILITIES, label: 'المرافق' },
    { value: ExpenseCategory.SUPPLIES, label: 'المستلزمات' },
    { value: ExpenseCategory.MARKETING, label: 'التسويق' },
    { value: ExpenseCategory.MAINTENANCE, label: 'الصيانة' },
    { value: ExpenseCategory.OTHER, label: 'أخرى' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private financeService: FinanceService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.searchForm = this.fb.group({
      searchTerm: ['']
    });
  }

  ngOnInit(): void {
    this.loadExpenses();
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
        this.filterExpenses();
      });
  }

  loadExpenses(): void {
    this.isLoading = true;
    this.financeService.getAllExpenses()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (expenses) => {
          this.expenses = expenses;
          this.filterExpenses();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading expenses:', error);
          this.toastr.error('حدث خطأ أثناء تحميل المصروفات');
          this.isLoading = false;
        }
      });
  }

  filterExpenses(): void {
    let filtered = [...this.expenses];
    const searchTerm = this.searchForm.get('searchTerm')?.value?.toLowerCase();

    if (searchTerm) {
      filtered = filtered.filter(expense => 
        expense.description?.toLowerCase().includes(searchTerm) || 
        this.getCategoryLabel(expense.category).toLowerCase().includes(searchTerm) || 
        String(expense.amount).includes(searchTerm)
      );
    }

    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(expense => expense.category === this.selectedCategory);
    }

    this.filteredExpenses = filtered;
  }

  onCategoryChange(category: ExpenseCategory | 'all'): void {
    this.selectedCategory = category;
    this.filterExpenses();
  }

  addExpense(): void {
    const modalRef = this.modalService.open(ExpenseFormComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadExpenses();
          this.toastr.success('تم تسجيل المصروف بنجاح');
        }
      },
      () => {} // Modal dismissed
    );
  }

  editExpense(expense: ExpenseDTO): void {
    const modalRef = this.modalService.open(ExpenseFormComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.componentInstance.expense = expense;

    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadExpenses();
          this.toastr.success('تم تحديث المصروف بنجاح');
        }
      },
      () => {} // Modal dismissed
    );
  }

  deleteExpense(expense: ExpenseDTO): void {
    if (confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
      this.financeService.deleteExpense(expense.expenseId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadExpenses();
            this.toastr.success('تم حذف المصروف بنجاح');
          },
          error: (error) => {
            console.error('Error deleting expense:', error);
            this.toastr.error('حدث خطأ أثناء حذف المصروف');
          }
        });
    }
  }

  getCategoryLabel(category: ExpenseCategory): string {
    const found = this.expenseCategories.find(c => c.value === category);
    return found ? found.label : '';
  }

  getCategoryIcon(category: ExpenseCategory): string {
    const icons: Record<ExpenseCategory, string> = {
      [ExpenseCategory.SALARY]: 'fas fa-user-tie',
      [ExpenseCategory.RENT]: 'fas fa-building',
      [ExpenseCategory.UTILITIES]: 'fas fa-bolt',
      [ExpenseCategory.SUPPLIES]: 'fas fa-box',
      [ExpenseCategory.MARKETING]: 'fas fa-ad',
      [ExpenseCategory.MAINTENANCE]: 'fas fa-tools',
      [ExpenseCategory.OTHER]: 'fas fa-ellipsis-h'
    };
    return icons[category];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}