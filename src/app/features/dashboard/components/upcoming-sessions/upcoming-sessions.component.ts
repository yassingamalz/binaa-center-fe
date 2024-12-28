import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SessionService } from '../../../sessions/services/session.service';
import { SessionFormComponent } from '../../../sessions/components/session-form/session-form.component';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-upcoming-sessions',
  templateUrl: './upcoming-sessions.component.html',
  styleUrls: ['./upcoming-sessions.component.scss']
})
export class UpcomingSessionsComponent implements OnInit, OnDestroy {
  upcomingSessions: any[] = [];
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private sessionService: SessionService,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadUpcomingSessions();
  }

  loadUpcomingSessions(): void {
    this.isLoading = true;
    this.sessionService.getUpcomingSessions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sessions) => {
          this.upcomingSessions = sessions;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading sessions:', error);
          this.toastr.error('حدث خطأ أثناء تحميل الجلسات');
          this.isLoading = false;
        }
      });
  }

  scheduleSession(): void {
    const modalRef = this.modalService.open(SessionFormComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true
    });

    modalRef.componentInstance.isEditMode = false;

    modalRef.closed.subscribe(result => {
      if (result) {
        this.toastr.success('تم جدولة الجلسة بنجاح');
        this.loadUpcomingSessions();
      }
    });
  }

  editSession(sessionId: number): void {
    const modalRef = this.modalService.open(SessionFormComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true
    });
    
    modalRef.componentInstance.sessionId = sessionId;
    modalRef.componentInstance.isEditMode = true;

    modalRef.closed.subscribe(result => {
      if (result) {
        this.toastr.success('تم تحديث الجلسة بنجاح');
        this.loadUpcomingSessions();
      }
    });
  }

  cancelSession(sessionId: number): void {
    if (confirm('هل أنت متأكد من إلغاء هذه الجلسة؟')) {
      this.isLoading = true;
      this.sessionService.deleteSession(sessionId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastr.success('تم إلغاء الجلسة بنجاح');
            this.loadUpcomingSessions();
          },
          error: (error) => {
            console.error('Error cancelling session:', error);
            this.toastr.error('حدث خطأ أثناء إلغاء الجلسة');
            this.isLoading = false;
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}