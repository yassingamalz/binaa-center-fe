// src/app/features/dashboard/components/monthly-income-chart/monthly-income-chart.component.ts
import { Component, ElementRef, OnInit, ViewChild, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { Color, LegendPosition, ScaleType } from '@swimlane/ngx-charts';
import { Subject, takeUntil } from 'rxjs';
import { FinancialSummary, PaymentWithDate } from '../../services/dashboard.service'; 
type PeriodType = 'week' | 'month' | 'quarter' | 'year' | 'overall';

interface ChartData {
  name: string;
  series: Array<{
    name: string;
    value: number;
    min: number;
  }>;
}

@Component({
  selector: 'app-monthly-income-chart',
  templateUrl: './monthly-income-chart.component.html',
  styleUrls: ['./monthly-income-chart.component.scss']
})
export class MonthlyIncomeChartComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('chartContainer') chartContainer!: ElementRef;

  // Chart properties
  LegendPosition = LegendPosition;
  selectedPeriod: PeriodType = 'month';
  chartData: ChartData[] = [];
  view: [number, number] = [700, 300];
  isLoading = false;

  // Color scheme configuration
  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#800080'] // Single purple color for income line
  };

  // Chart labels
  xAxisLabel: string = 'التاريخ';
  yAxisLabel: string = 'المبلغ (جنيه)';

  private destroy$ = new Subject<void>();

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.updateChart();
  }

  ngAfterViewInit(): void {
    this.updateChartDimensions();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateChartDimensions();
  }

  private updateChartDimensions(): void {
    if (this.chartContainer) {
      const containerWidth = this.chartContainer.nativeElement.offsetWidth;
      const containerHeight = Math.max(250, window.innerHeight * 0.3);
      this.view = [containerWidth, containerHeight];
    }
  }

  updateChart(): void {
    this.isLoading = true;
    const endDate = new Date();
    let startDate = new Date();

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
        next: (financialSummary) => {
          this.chartData = this.formatChartData(financialSummary, this.selectedPeriod);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading chart data:', error);
          this.isLoading = false;
        }
      });
  }

  private getDateFormat(period: PeriodType): Intl.DateTimeFormatOptions {
    const formats: Record<PeriodType, Intl.DateTimeFormatOptions> = {
      week: { weekday: 'short', day: 'numeric' },
      month: { day: 'numeric', month: 'short' },
      quarter: { month: 'short' },
      year: { month: 'short', year: 'numeric' },
      overall: { month: 'short', year: 'numeric' }
    };
    return formats[period];
  }

  private formatChartData(financialSummary: FinancialSummary, period: PeriodType): ChartData[] {
    const dateFormat = this.getDateFormat(period);
    
    // Group payments by date
    const groupedData = financialSummary.payments.reduce<Record<string, number>>((acc: Record<string, number>, payment: PaymentWithDate) => {
      const date = payment.paymentDate.toLocaleDateString('ar-EG', dateFormat);
      acc[date] = (acc[date] || 0) + payment.amount;
      return acc;
    }, {});
  
    // Sort dates and create series data
    const sortedDates = Object.entries(groupedData)
      .sort(([dateA], [dateB]) => {
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
  
    return [{
      name: 'الدخل',
      series: sortedDates.map(([date, value]) => ({
        name: date,
        value: Number(value), // Ensure value is a number
        min: 0
      }))
    }];
  }

  onSelect(event: any): void {
    console.log('Selected:', event);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}