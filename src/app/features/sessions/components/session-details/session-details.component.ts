// src/app/features/sessions/components/session-details/session-details.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { SessionService } from '../../services/session.service';
import { SessionFormComponent } from '../session-form/session-form.component';
import { ToastrService } from 'ngx-toastr';
import { SessionResponseDTO, AttendanceStatus } from '../../../../core/models/session';

@Component({
  selector: 'app-session-details',
  templateUrl: './session-details.component.html',
  styleUrls: ['./session-details.component.scss']
})
export class SessionDetailsComponent implements OnInit, OnDestroy {
  session?: SessionResponseDTO;
  isLoading = true;
  activeTab: 'info' | 'notes' | 'attachments' = 'info';
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sessionService: SessionService,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadSessionDetails();
  }

  private loadSessionDetails(): void {
    const sessionId = this.route.snapshot.params['id'];
    
    this.sessionService.getSessionById(sessionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (session) => {
          this.session = session;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading session:', error);
          this.toastr.error('حدث خطأ أثناء تحميل بيانات الجلسة');
          this.router.navigate(['/sessions']);
        }
      });
  }

  switchTab(tab: 'info' | 'notes' | 'attachments'): void {
    this.activeTab = tab;
  }

  editSession(): void {
    if (!this.session) return;

    const modalRef = this.modalService.open(SessionFormComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.componentInstance.session = this.session;

    modalRef.result.then(
      (result) => {
        if (result) {
          this.session = result;
          this.toastr.success('تم تحديث بيانات الجلسة بنجاح');
        }
      },
      () => {} // Modal dismissed
    );
  }

  toggleAttendance(): void {
    if (!this.session) return;

    const newStatus = this.session.attendanceStatus === AttendanceStatus.PRESENT 
      ? AttendanceStatus.ABSENT 
      : AttendanceStatus.PRESENT;

    this.sessionService.updateSession(this.session.sessionId, { 
      attendanceStatus: newStatus 
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedSession) => {
          this.session = updatedSession;
          this.toastr.success('تم تحديث حالة الحضور بنجاح');
        },
        error: (error) => {
          console.error('Error updating attendance:', error);
          this.toastr.error('حدث خطأ أثناء تحديث حالة الحضور');
        }
      });
  }

  deleteSession(): void {
    if (!this.session || !confirm('هل أنت متأكد من حذف هذه الجلسة؟')) return;

    this.sessionService.deleteSession(this.session.sessionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success('تم حذف الجلسة بنجاح');
          this.router.navigate(['/sessions']);
        },
        error: (error) => {
          console.error('Error deleting session:', error);
          this.toastr.error('حدث خطأ أثناء حذف الجلسة');
        }
      });
  }

  getStatusClass(): string {
    return this.session?.attendanceStatus.toLowerCase() || '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}