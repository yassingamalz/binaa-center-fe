// src/app/features/dashboard/pages/dashboard/dashboard.component.ts
import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subject, forkJoin, takeUntil } from "rxjs";
import { PeriodType } from "../../components/monthly-income-chart/monthly-income-chart.component";
import { SessionRange, SessionStats } from "../../components/session-overview/session-overview.component";
import { FinancialSummary, DashboardService } from "../../services/dashboard.service";

interface DashboardState {
  stats?: any;
  financialData?: FinancialSummary;
  sessionStats: SessionStats;
  selectedPeriod: PeriodType;
  selectedSessionRange: SessionRange;
}

interface LoadingState {
  stats: boolean;
  financial: boolean;
  sessions: boolean;
  quickActions: boolean;
  upcomingSessions: boolean;
  recentActivities: boolean;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  dashboardState: DashboardState = {
    selectedPeriod: 'month',
    selectedSessionRange: 'week',
    sessionStats: {
      totalSessions: 0,
      attendanceRate: 0,
      cancelledSessions: 0,
      byType: {}
    }
  };

  loadingState: LoadingState = {
    stats: true,
    financial: true,
    sessions: true,
    quickActions: true,
    upcomingSessions: true,
    recentActivities: true
  };

  private destroy$ = new Subject<void>();

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  private loadAllData(): void {
    this.loadStats();
    this.loadFinancialData();
    this.loadSessionData();
    this.loadQuickActions();
    this.loadUpcomingSessions();
    this.loadRecentActivities();
  }

  private loadStats(): void {
    this.loadingState.stats = true;
    this.dashboardService.getDashboardStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.dashboardState.stats = stats;
          this.loadingState.stats = false;
        },
        error: (error) => {
          console.error('Error loading stats:', error);
          this.loadingState.stats = false;
        }
      });
  }

  private loadFinancialData(): void {
    this.loadingState.financial = true;
    const dates = this.calculateDateRanges();
    
    this.dashboardService.getFinancialOverview(dates.financial.start, dates.financial.end)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.dashboardState.financialData = data;
          this.loadingState.financial = false;
        },
        error: (error) => {
          console.error('Error loading financial data:', error);
          this.loadingState.financial = false;
        }
      });
  }

  private loadSessionData(): void {
    this.loadingState.sessions = true;
    const dates = this.calculateDateRanges();

    this.dashboardService.getSessionsOverview(dates.sessions.start, dates.sessions.end)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.dashboardState.sessionStats = data;
          this.loadingState.sessions = false;
        },
        error: (error) => {
          console.error('Error loading session data:', error);
          this.loadingState.sessions = false;
        }
      });
  }

  private loadQuickActions(): void {
    this.loadingState.quickActions = true;
    // Implement quick actions loading
    setTimeout(() => this.loadingState.quickActions = false, 1000);
  }

  private loadUpcomingSessions(): void {
    this.loadingState.upcomingSessions = true;
    // Implement upcoming sessions loading
    setTimeout(() => this.loadingState.upcomingSessions = false, 1500);
  }

  private loadRecentActivities(): void {
    this.loadingState.recentActivities = true;
    // Implement recent activities loading
    setTimeout(() => this.loadingState.recentActivities = false, 2000);
  }

  onPeriodChange(period: PeriodType): void {
    this.dashboardState.selectedPeriod = period;
    this.loadFinancialData();
  }

  onSessionRangeChange(range: SessionRange): void {
    this.dashboardState.selectedSessionRange = range;
    this.loadSessionData();
  }

  private calculateDateRanges() {
    const now = new Date();
    return {
      financial: {
        start: this.calculateStartDate(this.dashboardState.selectedPeriod),
        end: now
      },
      sessions: {
        start: this.calculateStartDate(this.dashboardState.selectedSessionRange),
        end: now
      }
    };
  }

  private calculateStartDate(period: PeriodType | SessionRange): Date {
    const startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'overall':
        startDate.setFullYear(2000);
        break;
    }

    return startDate;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}