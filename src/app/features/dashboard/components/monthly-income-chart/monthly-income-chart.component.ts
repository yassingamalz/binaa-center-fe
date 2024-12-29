// src/app/features/dashboard/components/monthly-income-chart/monthly-income-chart.component.ts
import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit, HostListener, EventEmitter, Output } from '@angular/core';
import { Color, LegendPosition, ScaleType } from '@swimlane/ngx-charts';
import { FinancialSummary } from '../../services/dashboard.service';

export type PeriodType = 'week' | 'month' | 'quarter' | 'year' | 'overall';

interface ChartData {
  name: string;
  series: { name: string; value: number; }[];
}

@Component({
  selector: 'app-monthly-income-chart',
  templateUrl: './monthly-income-chart.component.html',
  styleUrls: ['./monthly-income-chart.component.scss']
})
export class MonthlyIncomeChartComponent implements OnChanges, AfterViewInit {
  @Input() financialData?: FinancialSummary;
  @Input() isLoading = false;
  @Input() selectedPeriod: PeriodType = 'month';
  @Output() periodChange = new EventEmitter<PeriodType>();

  @ViewChild('chartContainer') chartContainer!: ElementRef;

  // Chart Data
  chartData: ChartData[] = [];
  view: [number, number] = [700, 300];

  // Chart Configuration
  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#800080', '#FF69B4', '#4CAF50']
  };

  // Chart Options
  showXAxis = true;
  showYAxis = true;
  gradient = true;
  showLegend = true;
  showXAxisLabel = true;
  showYAxisLabel = true;
  legendPosition = LegendPosition.Below;
  legendTitle = '';
  animations = true;
  showGridLines = true;
  roundDomains = true;
  xAxisLabel = 'التاريخ';
  yAxisLabel = 'المبلغ (جنيه)';

  periodOptions = [
    { value: 'overall', label: 'كل الفترة' },
    { value: 'year', label: 'سنة' },
    { value: 'quarter', label: 'ربع سنوي' },
    { value: 'month', label: 'شهر' },
    { value: 'week', label: 'أسبوع' }
  ];

  yAxisTickFormatting = (value: any): string => 
    value.toLocaleString('ar-EG') + ' ج.م';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['financialData'] && this.financialData) {
      this.updateChart();
    }
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
    if (!this.financialData) return;
    this.chartData = this.formatChartData(this.financialData);
  }

  private formatChartData(data: FinancialSummary): ChartData[] {
    const dateFormat = this.getDateFormat(this.selectedPeriod);
    const dataMap = new Map<string, { income: number; expenses: number; net: number }>();

    // Process payments
    data.payments.forEach(payment => {
      const date = new Date(payment.paymentDate).toLocaleDateString('ar-EG', dateFormat);
      const point = dataMap.get(date) || { income: 0, expenses: 0, net: 0 };
      point.income += payment.amount;
      point.net = point.income - point.expenses;
      dataMap.set(date, point);
    });

    // Process expenses
    data.expenses.forEach(expense => {
      const date = new Date(expense.date).toLocaleDateString('ar-EG', dateFormat);
      const point = dataMap.get(date) || { income: 0, expenses: 0, net: 0 };
      point.expenses += expense.amount;
      point.net = point.income - point.expenses;
      dataMap.set(date, point);
    });

    // Sort and format data
    const sortedData = Array.from(dataMap.entries())
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());

    return [
      {
        name: 'الدخل',
        series: sortedData.map(([date, values]) => ({
          name: date,
          value: values.income
        }))
      },
      {
        name: 'المصروفات',
        series: sortedData.map(([date, values]) => ({
          name: date,
          value: values.expenses
        }))
      },
      {
        name: 'صافي الدخل',
        series: sortedData.map(([date, values]) => ({
          name: date,
          value: values.net
        }))
      }
    ];
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

  onPeriodChange(period: PeriodType): void {
    this.periodChange.emit(period);
  }

  onSelect(event: any): void {
    console.log('Item clicked', event);
  }
}

