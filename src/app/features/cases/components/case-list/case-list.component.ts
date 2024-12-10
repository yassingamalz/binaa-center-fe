// case-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { CaseService } from '../../services/case.service';
import { ToastrService } from 'ngx-toastr';
import { CaseDTO, CaseStatus } from '../../../../core/models/case';

@Component({
  selector: 'app-case-list',
  templateUrl: './case-list.component.html',
  styleUrls: ['./case-list.component.scss']
})
export class CaseListComponent implements OnInit, OnDestroy {
  cases: CaseDTO[] = [];
  filteredCases: CaseDTO[] = [];
  isLoading = false;
  searchForm: FormGroup;
  CaseStatus = CaseStatus;
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalCases = 0;
  
  // Filtering
  statusFilter: CaseStatus | 'all' = 'all';
  
  private destroy$ = new Subject<void>();

  constructor(
    private caseService: CaseService,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.searchForm = this.fb.group({
      searchTerm: ['']
    });
  }

  ngOnInit(): void {
    this.loadCases();
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
        this.filterCases();
      });
  }

  loadCases(): void {
    this.isLoading = true;
    this.caseService.getAllCases()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cases) => {
          this.cases = cases;
          this.filterCases();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading cases:', error);
          this.toastr.error('حدث خطأ أثناء تحميل الحالات');
          this.isLoading = false;
        }
      });
  }

  filterCases(): void {
    let filtered = [...this.cases];
    const searchTerm = this.searchForm.get('searchTerm')?.value?.toLowerCase();

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(case_ => 
        case_.name.toLowerCase().includes(searchTerm) ||
        case_.guardianName.toLowerCase().includes(searchTerm) ||
        case_.contactNumber.includes(searchTerm)
      );
    }

    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(case_ => case_.status === this.statusFilter);
    }

    // Update pagination
    this.totalCases = filtered.length;
    
    // Apply pagination
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.filteredCases = filtered.slice(startIndex, startIndex + this.pageSize);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.filterCases();
  }

  onStatusFilterChange(status: CaseStatus | 'all'): void {
    this.statusFilter = status;
    this.currentPage = 1;
    this.filterCases();
  }

  viewCaseDetails(caseId: number): void {
    this.router.navigate(['/cases', caseId]);
  }

  editCase(caseId: number, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/cases', caseId, 'edit']);
  }

  createNewCase(): void {
    this.router.navigate(['/cases/new']);
  }

  getTotalPages(): number {
    return Math.ceil(this.totalCases / this.pageSize);
  }
  
  toggleCaseStatus(caseId: number, event: Event): void {
    event.stopPropagation();
    const case_ = this.cases.find(c => c.caseId === caseId);
    if (!case_) return;

    const newStatus = case_.status === CaseStatus.ACTIVE 
      ? CaseStatus.INACTIVE 
      : CaseStatus.ACTIVE;

    this.caseService.updateCase(caseId, { status: newStatus })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          case_.status = newStatus;
          this.toastr.success('تم تحديث حالة الملف بنجاح');
          this.filterCases();
        },
        error: (error) => {
          console.error('Error updating case status:', error);
          this.toastr.error('حدث خطأ أثناء تحديث حالة الملف');
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}