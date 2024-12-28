// stats-cards.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-stats-cards',
  templateUrl: './stats-cards.component.html',
  styleUrls: ['./stats-cards.component.scss']
})
export class StatsCardsComponent implements OnInit, OnDestroy {
  stats: any = {};
  isLoading = true;
  private destroy$ = new Subject<void>();

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    this.dashboardService.getDashboardStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.stats = data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading stats:', error);
          this.isLoading = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}