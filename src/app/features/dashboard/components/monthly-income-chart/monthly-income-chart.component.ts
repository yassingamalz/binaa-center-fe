// src/app/features/dashboard/components/monthly-income-chart/monthly-income-chart.component.ts
import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { Subject, takeUntil } from 'rxjs';

type PeriodType = 'week' | 'month' | 'quarter' | 'year' | 'overall';

@Component({
  selector: 'app-monthly-income-chart',
  templateUrl: './monthly-income-chart.component.html',
  styleUrls: ['./monthly-income-chart.component.scss']
})
export class MonthlyIncomeChartComponent implements OnInit, OnDestroy {
  @ViewChild('chartContainer') chartContainer!: ElementRef;

  selectedPeriod: PeriodType = 'month';
  chartData: any[] = [];
  view: [number, number] = [700, 300];
  isLoading = false;

  private destroy$ = new Subject<void>();

  // Chart options
  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#800080', '#FF69B4', '#FFA500']
  };

  // Labels
  xAxisLabel: string = 'التاريخ';
  yAxisLabel: string = 'المبلغ (جنيه)';

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.updateChart();
  }

  ngAfterViewInit(): void {
    this.updateChartDimensions();
    const resizeObserver = new ResizeObserver(() => this.updateChartDimensions());
    resizeObserver.observe(this.chartContainer.nativeElement);
  }

  updateChartDimensions(): void {
    if (this.chartContainer) {
      const containerWidth = this.chartContainer.nativeElement.offsetWidth;
      const containerHeight = Math.max(300, window.innerHeight * 0.4);
      this.view = [containerWidth, containerHeight];
    }
  }

  updateChart(): void {
    this.isLoading = true;
    const endDate = new Date();
    let startDate = new Date();

    // Calculate start date based on selected period
    switch (this.selectedPeriod) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case 'overall':
        startDate = new Date(0); // From beginning
        break;
    }

    this.dashboardService.getFinancialOverview(startDate, endDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.chartData = this.formatChartData(data, this.selectedPeriod);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading chart data:', error);
          this.isLoading = false;
        }
      });
  }

  private formatChartData(data: any, period: PeriodType): any[] {
    const dateFormat: Intl.DateTimeFormatOptions = this.getDateFormat(period);
    
    const groupedData = data.payments.reduce((acc: any, payment: any) => {
      const date = new Date(payment.paymentDate).toLocaleDateString('ar-EG', dateFormat);
      
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += payment.amount;
      return acc;
    }, {});

    // Sort dates
    const sortedDates = Object.entries(groupedData)
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());

    return [{
      name: 'الدخل',
      series: sortedDates.map(([date, value]) => ({
        name: date,
        value: value,
        min: 0 // Ensures chart starts from 0
      }))
    }];
  }

  private getDateFormat(period: PeriodType): Intl.DateTimeFormatOptions {
    switch (period) {
      case 'week':
        return { weekday: 'short', day: 'numeric' };
      case 'month':
        return { day: 'numeric', month: 'short' };
      case 'quarter':
        return { month: 'short' };
      case 'year':
        return { month: 'short', year: 'numeric' };
      case 'overall':
        return { month: 'short', year: 'numeric' };
      default:
        return { month: 'short', day: 'numeric' };
    }
  }

  onSelect(event: any): void {
    console.log('Selected:', event);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}