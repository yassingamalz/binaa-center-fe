// src/app/features/sessions/components/session-list/session-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { SessionService } from '../../services/session.service';
import { ToastrService } from 'ngx-toastr';
import { SessionFormComponent } from '../session-form/session-form.component';
import { SessionDTO, SessionType, AttendanceStatus, SessionResponseDTO } from '../../../../core/models/session';

interface FilterOption<T> {
  value: T | 'all';
  label: string;
}

@Component({
  selector: 'app-session-list',
  templateUrl: './session-list.component.html',
  styleUrls: ['./session-list.component.scss']
})
export class SessionListComponent implements OnInit, OnDestroy {
  sessions: SessionResponseDTO[] = [];
  filteredSessions: SessionResponseDTO[] = [];
  isLoading = false;
  searchForm: FormGroup;

  selectedType: SessionType | 'all' = 'all';
  selectedStatus: AttendanceStatus | 'all' = 'all';

  sessionTypes: FilterOption<SessionType>[] = [
    { value: 'all', label: 'الكل' },
    { value: SessionType.INDIVIDUAL, label: 'فردي' },
    { value: SessionType.GROUP, label: 'جماعي' }
  ];

  attendanceStatuses: FilterOption<AttendanceStatus>[] = [
    { value: 'all', label: 'الكل' },
    { value: AttendanceStatus.PRESENT, label: 'حضر' },
    { value: AttendanceStatus.ABSENT, label: 'غائب' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private sessionService: SessionService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.searchForm = this.fb.group({
      searchTerm: ['']
    });
  }

  ngOnInit(): void {
    this.loadSessions();
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
        this.filterSessions();
      });
  }

  loadSessions(): void {
    this.isLoading = true;
    this.sessionService.getAllSessions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sessions) => {
          this.sessions = sessions;
          this.filterSessions();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading sessions:', error);
          this.toastr.error('حدث خطأ أثناء تحميل الجلسات');
          this.isLoading = false;
        }
      });
  }

  filterSessions(): void {
    let filtered = [...this.sessions];
    const searchTerm = this.searchForm.get('searchTerm')?.value?.toLowerCase();

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(session =>
        session.caseName?.toLowerCase().includes(searchTerm) ||
        session.staffName?.toLowerCase().includes(searchTerm) ||
        session.purpose?.toLowerCase().includes(searchTerm) ||
        (session.notes?.toLowerCase().includes(searchTerm)) ||
        (session.sessionType === SessionType.INDIVIDUAL ? 'فردي' : 'جماعي').toLowerCase().includes(searchTerm) ||
        (session.attendanceStatus === AttendanceStatus.PRESENT ? 'حضر' : 'غائب').toLowerCase().includes(searchTerm)
      );
    }

    // Type filter
    if (this.selectedType !== 'all') {
      filtered = filtered.filter(session => session.sessionType === this.selectedType);
    }

    // Status filter
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(session => session.attendanceStatus === this.selectedStatus);
    }

    this.filteredSessions = filtered;
  }

  onTypeChange(type: SessionType | 'all'): void {
    this.selectedType = type;
    this.filterSessions();
  }

  onStatusChange(status: AttendanceStatus | 'all'): void {
    this.selectedStatus = status;
    this.filterSessions();
  }

  createSession(): void {
    const modalRef = this.modalService.open(SessionFormComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadSessions();
          this.toastr.success('تم إنشاء الجلسة بنجاح');
        }
      },
      () => { } // Modal dismissed
    );
  }

  viewSessionDetails(sessionId: number): void {
    this.router.navigate(['/sessions', sessionId]);
  }

  editSession(session: SessionDTO, event: Event): void {
    event.stopPropagation();
    const modalRef = this.modalService.open(SessionFormComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.componentInstance.session = session;

    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadSessions();
          this.toastr.success('تم تحديث الجلسة بنجاح');
        }
      },
      () => { } // Modal dismissed
    );
  }

  deleteSession(session: SessionDTO, event: Event): void {
    event.stopPropagation();
    if (confirm('هل أنت متأكد من حذف هذه الجلسة؟')) {
      this.sessionService.deleteSession(session.sessionId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadSessions();
            this.toastr.success('تم حذف الجلسة بنجاح');
          },
          error: (error) => {
            console.error('Error deleting session:', error);
            this.toastr.error('حدث خطأ أثناء حذف الجلسة');
          }
        });
    }
  }

  getStatusClass(status: AttendanceStatus): string {
    return status.toLowerCase();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}