// src/app/features/dashboard/components/session-overview/session-overview.component.ts
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { Color, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-session-overview',
  templateUrl: './session-overview.component.html',
  styleUrls: ['./session-overview.component.scss']
})
export class SessionOverviewComponent implements OnInit {
  @ViewChild('chartContainer') chartContainer!: ElementRef;

  selectedRange: 'week' | 'month' | 'quarter' = 'week';
  chartData: any[] = [];
  view: [number, number] = [700, 300];

  // Statistics
  attendanceRate: number = 0;
  totalSessions: number = 0;
  cancelledSessions: number = 0;

  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#800080', '#FF69B4']
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.updateOverview();
  }

  ngAfterViewInit(): void {
    this.updateChartDimensions();
    window.addEventListener('resize', () => this.updateChartDimensions());
  }

  updateChartDimensions(): void {
    if (this.chartContainer) {
      const containerWidth = this.chartContainer.nativeElement.offsetWidth;
      this.view = [containerWidth, 300];
    }
  }

  updateOverview(): void {
    this.dashboardService.getSessionsOverview()
      .subscribe({
        next: (data) => {
          this.updateStats(data);
          this.chartData = this.formatChartData(data);
        },
        error: (error) => console.error('Error loading overview:', error)
      });
  }

  private updateStats(data: any): void {
    this.attendanceRate = data.attendanceRate || 0;
    this.totalSessions = data.totalSessions || 0;
    this.cancelledSessions = data.cancelledSessions || 0;
  }

  private formatChartData(data: any): any[] {
    return data.sessions
      .slice(-7) // Last 7 days
      .reverse() // Reverse for RTL
      .map((session: any) => ({
        name: new Date(session.date).toLocaleDateString('ar-EG', {
          month: 'short',
          day: 'numeric'
        }),
        value: session.total
      }));
  }

  onSelect(event: any): void {
    console.log('Item clicked', event);
  }
}