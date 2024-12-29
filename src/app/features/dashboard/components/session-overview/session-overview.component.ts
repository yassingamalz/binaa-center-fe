// src/app/features/dashboard/components/session-overview/session-overview.component.ts
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Color, ScaleType } from '@swimlane/ngx-charts';

export type SessionRange = 'week' | 'month' | 'quarter' | 'year';

export interface SessionStats {
  totalSessions: number;
  attendanceRate: number;
  cancelledSessions: number;
  byType: Record<string, number>;
}

@Component({
  selector: 'app-session-overview',
  templateUrl: './session-overview.component.html',
  styleUrls: ['./session-overview.component.scss']
})
export class SessionOverviewComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() sessionStats: SessionStats = {
    totalSessions: 0,
    attendanceRate: 0,
    cancelledSessions: 0,
    byType: {}
  };
  @Input() selectedRange: SessionRange = 'week';
  @Input() isLoading = false;
  @Output() rangeChange = new EventEmitter<SessionRange>();
  
  @ViewChild('chartContainer') chartContainer!: ElementRef;

  // Chart configuration
  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#800080', '#FF69B4']
  };
  
  chartData: any[] = [];
  view: [number, number] = [700, 300];
  
  // Chart options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = false;
  showXAxisLabel = false;
  showYAxisLabel = false;
  animations = true;
  animationsDuration = 500;

  private resizeObserver: ResizeObserver;

  constructor() {
    this.resizeObserver = new ResizeObserver(() => this.updateChartDimensions());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sessionStats'] && !changes['sessionStats'].firstChange) {
      this.updateChartData();
    }
  }

  ngAfterViewInit(): void {
    this.updateChartDimensions();
    if (this.chartContainer?.nativeElement) {
      this.resizeObserver.observe(this.chartContainer.nativeElement);
    }
    this.updateChartData();
  }

  updateChartDimensions(): void {
    if (this.chartContainer) {
      const containerWidth = this.chartContainer.nativeElement.offsetWidth;
      const containerHeight = Math.max(300, window.innerHeight * 0.4);
      this.view = [containerWidth, containerHeight];
    }
  }

  onRangeChange(range: SessionRange): void {
    this.rangeChange.emit(range);
  }

  private updateChartData(): void {
    if (!this.sessionStats) return;

    const attendedSessions = this.sessionStats.totalSessions - this.sessionStats.cancelledSessions;

    this.chartData = [
      {
        name: 'حضور',
        value: attendedSessions
      },
      {
        name: 'ملغاة',
        value: this.sessionStats.cancelledSessions
      }
    ];

    // Force chart update by creating a new array reference
    this.chartData = [...this.chartData];
  }

  ngOnDestroy(): void {
    if (this.chartContainer?.nativeElement) {
      this.resizeObserver.unobserve(this.chartContainer.nativeElement);
    }
    this.resizeObserver.disconnect();
  }
}