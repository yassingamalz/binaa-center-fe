// src/app/features/dashboard/components/monthly-income-chart/monthly-income-chart.component.ts
import { Component, ElementRef, OnInit, ViewChild, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { Color, LegendPosition, ScaleType } from '@swimlane/ngx-charts';
import { curveLinear, curveBasis, curveMonotoneX, curveStep, curveStepAfter, curveStepBefore } from 'd3-shape';
import { Subject, takeUntil } from 'rxjs';
import { FinancialSummary, PaymentWithDate, ExpenseWithDate } from '../../services/dashboard.service';

export type PeriodType = 'week' | 'month' | 'quarter' | 'year' | 'overall';

interface ChartDataPoint {
  name: string;
  income: number;
  expenses: number;
  net: number;
}

interface ChartSeries {
  name: string;
  value: number;
}

interface ChartData {
  name: string;
  series: ChartSeries[];
}

@Component({
  selector: 'app-monthly-income-chart',
  templateUrl: './monthly-income-chart.component.html',
  styleUrls: ['./monthly-income-chart.component.scss']
})
export class MonthlyIncomeChartComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('chartContainer') chartContainer!: ElementRef;

  selectedPeriod: PeriodType = 'month';
  chartData: ChartData[] = [];
  view: [number, number] = [700, 300];
  isLoading = false;

  // Chart options
  showXAxis = true;
  showYAxis = true;
  gradient = true;
  showLegend = true;
  showXAxisLabel = true;
  showYAxisLabel = true;
  legendPosition = LegendPosition.Below;
  legendTitle = '';
  timeline = false;
  animations = true;
  showGridLines = true;
  roundDomains = true;
  rangeFillOpacity = 0.15; 

  xAxisLabel = 'التاريخ';
  yAxisLabel = 'المبلغ (جنيه)';

  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#800080', '#FF69B4', '#4CAF50']
  };

  periodOptions = [
    { value: 'overall', label: 'كل الفترة' },
    { value: 'year', label: 'سنة' },
    { value: 'quarter', label: 'ربع سنوي' },
    { value: 'month', label: 'شهر' },
    { value: 'week', label: 'أسبوع' }
  ];

  // RTL support
  yAxisTickFormatting = (value: any): string => {
    return value.toLocaleString('ar-EG') + ' ج.م';
  };

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
      const containerHeight = Math.max(300, window.innerHeight * 0.4);
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
        startDate = new Date(0);
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
    const dataMap = new Map<string, ChartDataPoint>();

    const initializeDataPoint = (): ChartDataPoint => ({
      name: '',
      income: 0,
      expenses: 0,
      net: 0
    });

    // Process data and create translation-ready names
    const arabicLabels = {
      income: 'الدخل',
      expenses: 'المصروفات',
      net: 'صافي الدخل'
    };

    financialSummary.payments.forEach((payment: PaymentWithDate) => {
      const date = payment.paymentDate.toLocaleDateString('ar-EG', dateFormat);
      const point = dataMap.get(date) || { ...initializeDataPoint(), name: date };
      point.income += payment.amount;
      point.net = point.income - point.expenses;
      dataMap.set(date, point);
    });

    financialSummary.expenses.forEach((expense: ExpenseWithDate) => {
      const date = expense.date.toLocaleDateString('ar-EG', dateFormat);
      const point = dataMap.get(date) || { ...initializeDataPoint(), name: date };
      point.expenses += expense.amount;
      point.net = point.income - point.expenses;
      dataMap.set(date, point);
    });

    // Sort and reverse for RTL
    const sortedData = Array.from(dataMap.values())
      .sort((a, b) => new Date(b.name).getTime() - new Date(a.name).getTime());

    return [
      {
        name: arabicLabels.income,
        series: sortedData.map(point => ({
          name: point.name,
          value: point.income
        }))
      },
      {
        name: arabicLabels.expenses,
        series: sortedData.map(point => ({
          name: point.name,
          value: point.expenses
        }))
      },
      {
        name: arabicLabels.net,
        series: sortedData.map(point => ({
          name: point.name,
          value: point.net
        }))
      }
    ];
  }

  onSelect(event: any): void {
    console.log('Item clicked', event);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}