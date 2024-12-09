import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-recent-activities',
  templateUrl: './recent-activities.component.html',
  styleUrls: ['./recent-activities.component.scss']
})
export class RecentActivitiesComponent implements OnInit, OnDestroy {
  activities: any[] = [];
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadActivities();
  }

  loadActivities(): void {
    this.isLoading = true;
    this.dashboardService.getRecentActivities()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.activities = data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading activities:', error);
          this.isLoading = false;
        }
      });
  }

  getActivityIcon(type: string): string {
    const icons = {
      session: 'fas fa-calendar-check',
      payment: 'fas fa-money-bill-wave',
      assessment: 'fas fa-clipboard-list'
    };
    return icons[type as keyof typeof icons] || 'fas fa-info-circle';
  }

  getActivityTitle(activity: any): string {
    const titles = {
      session: 'جلسة جديدة',
      payment: 'دفعة مالية',
      assessment: 'تقييم جديد'
    };
    return titles[activity.type as keyof typeof titles] || 'نشاط جديد';
  }

  getActivityDescription(activity: any): string {
    switch (activity.type) {
      case 'session':
        return `جلسة ${activity.details.purpose}`;
      case 'payment':
        return `دفعة بقيمة ${activity.details.amount} جنيه`;
      case 'assessment':
        return `تقييم ${activity.details.assessmentType}`;
      default:
        return 'نشاط غير معروف';
    }
  }

  viewAllActivities(): void {
    this.router.navigate(['/activities']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}