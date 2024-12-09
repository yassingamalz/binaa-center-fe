import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../../../sessions/services/session.service';
import { Subject, takeUntil } from 'rxjs';

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
    private router: Router
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
          this.isLoading = false;
        }
      });
  }

  scheduleSession(): void {
    this.router.navigate(['/sessions/schedule']);
  }

  editSession(sessionId: number): void {
    this.router.navigate(['/sessions', sessionId, 'edit']);
  }

  cancelSession(sessionId: number): void {
    // Implement session cancellation logic
    console.log('Cancelling session:', sessionId);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}