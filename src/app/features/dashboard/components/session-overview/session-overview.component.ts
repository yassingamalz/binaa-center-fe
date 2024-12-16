// src/app/features/dashboard/components/session-overview/session-overview.component.ts
import { Component, ElementRef, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { Subject, takeUntil } from 'rxjs';

interface SessionStats {
  totalSessions: number;
  attendanceRate: number;
  cancelledSessions: number;
  byType: Record<string, number>;
}

interface ChartDataPoint {
  name: string;
  value: number;
}

@Component({
  selector: 'app-session-overview',
  templateUrl: './session-overview.component.html',
  styleUrls: ['./session-overview.component.scss']
})
export class SessionOverviewComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartContainer') chartContainer!: ElementRef;

  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#800080', '#ff4081'] // Purple for attended, Pink for cancelled
  };
  // Form controls
  selectedRange: 'week' | 'month' | 'quarter' | 'year' = 'week';

  // Chart data and dimensions
  chartData: ChartDataPoint[] = [];
  view: [number, number] = [700, 300];

  // Statistics
  attendanceRate: number = 0;
  totalSessions: number = 0;
  cancelledSessions: number = 0;
  isLoading: boolean = false;

  // Chart options
  showXAxis: boolean = true;
  showYAxis: boolean = true;
  gradient: boolean = false;
  showLegend: boolean = false;
  showXAxisLabel: boolean = false;
  showYAxisLabel: boolean = false;
  animations: boolean = true;

  private destroy$ = new Subject<void>();
  private resizeObserver: ResizeObserver;

  constructor(private dashboardService: DashboardService) {
    const styles = getComputedStyle(document.documentElement);
  
    this.colorScheme = {
      name: 'custom',
      selectable: true,
      group: ScaleType.Ordinal,
      domain: [
        styles.getPropertyValue('--color-primary').trim() || '#800080',  // Primary color
        styles.getPropertyValue('--color-secondary').trim() || '#ff4081' // Secondary color
      ]
    };

    this.resizeObserver = new ResizeObserver(() => this.updateChartDimensions());
  }

  ngOnInit(): void {
    this.updateOverview();
  }

  ngAfterViewInit(): void {
    this.updateChartDimensions();

    if (this.chartContainer?.nativeElement) {
      this.resizeObserver.observe(this.chartContainer.nativeElement);
    }
  }

  updateChartDimensions(): void {
    if (this.chartContainer) {
      const containerWidth = this.chartContainer.nativeElement.offsetWidth;
      this.view = [containerWidth, 300];
    }
  }

  updateOverview(): void {
    this.isLoading = true;
    const { startDate, endDate } = this.calculateDateRange();

    this.dashboardService.getSessionsOverview(startDate, endDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.updateStats(data);
          this.chartData = this.formatChartData(data);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading session overview:', error);
          this.isLoading = false;
          this.resetData();
        }
      });
  }

  private updateStats(data: SessionStats): void {
    this.attendanceRate = data.attendanceRate || 0;
    this.totalSessions = data.totalSessions || 0;
    this.cancelledSessions = data.cancelledSessions || 0;
  }

  private formatChartData(data: SessionStats): any[] {
    return [
      {
        name: 'حضور',
        value: data.totalSessions - data.cancelledSessions
      },
      {
        name: 'ملغاة',
        value: data.cancelledSessions
      }
    ];
  }

  private getSessionTypeLabel(type: string): string {
    const types: Record<string, string> = {
      'INDIVIDUAL': 'فردي',
      'GROUP': 'جماعي'
    };
    return types[type] || type;
  }

  private calculateDateRange(): { startDate: Date; endDate: Date } {
    const endDate = new Date();
    let startDate = new Date();

    switch (this.selectedRange) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;

      case 'month':
        startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        break;

      case 'quarter':
        const quarterStartMonth = Math.floor(endDate.getMonth() / 3) * 3;
        startDate = new Date(endDate.getFullYear(), quarterStartMonth, 1);
        break;

      case 'year':
        startDate = new Date(endDate.getFullYear(), 0, 1);
        break;
    }

    // Set time to start/end of day
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate };
  }

  private resetData(): void {
    this.attendanceRate = 0;
    this.totalSessions = 0;
    this.cancelledSessions = 0;
    this.chartData = [];
  }

  // Chart event handlers
  onSelect(event: any): void {
    console.log('Bar clicked:', event);
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.destroy$.next();
    this.destroy$.complete();

    // Clean up resize observer
    if (this.chartContainer?.nativeElement) {
      this.resizeObserver.unobserve(this.chartContainer.nativeElement);
    }
    this.resizeObserver.disconnect();
  }
}