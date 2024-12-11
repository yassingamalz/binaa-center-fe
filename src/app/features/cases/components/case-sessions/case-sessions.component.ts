// src\app\features\cases\components\case-sessions\case-sessions.component.tsimport { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Component, OnInit, OnDestroy, Input, ErrorHandler } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { AttendanceStatus, SessionDTO } from '../../../../core/models/session';
import { SessionFormComponent } from '../../../sessions/components/session-form/session-form.component';
import { SessionService } from '../../../sessions/services/session.service';

interface SessionStatus {
  value: AttendanceStatus | 'all';
  label: string;
}

@Component({
  selector: 'app-case-sessions',
  templateUrl: './case-sessions.component.html',
  styleUrls: ['./case-sessions.component.scss']
})
export class CaseSessionsComponent implements OnInit, OnDestroy {
  @Input() caseId!: number;

  // Data
  sessions: SessionDTO[] = [];
  filteredSessions: SessionDTO[] = [];
  isLoading = false;

  // Dates
  startDate = new Date();
  endDate = new Date();

  // Filters
  selectedStatus: AttendanceStatus | 'all' = 'all';
  
  sessionStatuses: SessionStatus[] = [
    { value: 'all', label: 'الكل' },
    { value: AttendanceStatus.PRESENT, label: 'حضر' },
    { value: AttendanceStatus.ABSENT, label: 'غائب' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private sessionService: SessionService,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {
    // Initialize date range to last month
    this.startDate.setMonth(this.startDate.getMonth() - 1);
  }

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.isLoading = true;

    this.sessionService.getSessionsByCase(this.caseId)
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

    // Date filter
    filtered = filtered.filter(session => {
      const sessionDate = new Date(session.sessionDate);
      return sessionDate >= this.startDate && sessionDate <= this.endDate;
    });

    // Status filter
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(session => 
        session.attendanceStatus === this.selectedStatus
      );
    }

    // Sort by date descending
    filtered.sort((a, b) => 
      new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
    );

    this.filteredSessions = filtered;
  }

  onDateChange(event: any, type: 'start' | 'end'): void {
    if (type === 'start') {
      this.startDate = new Date(event);
    } else {
      this.endDate = new Date(event);
    }
    this.filterSessions();
  }

  filterByStatus(status: AttendanceStatus | 'all'): void {
    this.selectedStatus = status;
    this.filterSessions();
  }

  async addSession(): Promise<void> {
    try {
      const modalRef = this.modalService.open(SessionFormComponent, {
        size: 'lg',
        backdrop: 'static'
      });
      
      modalRef.componentInstance.caseId = this.caseId;

      const result = await modalRef.result;
      if (result) {
        this.loadSessions();
        this.toastr.success('تم إضافة الجلسة بنجاح');
      }
    } catch (error) {
      // Modal dismissed
    }
  }

  async editSession(session: SessionDTO): Promise<void> {
    try {
      const modalRef = this.modalService.open(SessionFormComponent, {
        size: 'lg',
        backdrop: 'static'
      });
      
      modalRef.componentInstance.caseId = this.caseId;
      modalRef.componentInstance.session = session;

      const result = await modalRef.result;
      if (result) {
        this.loadSessions();
        this.toastr.success('تم تحديث الجلسة بنجاح');
      }
    } catch (error) {
      // Modal dismissed
    }
  }

  async deleteSession(session: SessionDTO): Promise<void> {
    try {
      const confirmed = await this.showConfirmDialog(
        'حذف الجلسة',
        'هل أنت متأكد من حذف هذه الجلسة؟'
      );

      if (confirmed) {
        await this.sessionService.deleteSession(session.sessionId).toPromise();
        this.loadSessions();
        this.toastr.success('تم حذف الجلسة بنجاح');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      this.toastr.error('حدث خطأ أثناء حذف الجلسة');
    }
  }

  private showConfirmDialog(title: string, message: string): Promise<boolean> {
    const modalRef = this.modalService.open(ErrorHandler);
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.message = message;
    return modalRef.result;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}