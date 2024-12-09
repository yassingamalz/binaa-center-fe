// src/app/features/dashboard/components/monthly-income-chart/monthly-income-chart.component.ts
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { Color, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-monthly-income-chart',
  templateUrl: './monthly-income-chart.component.html',
  styleUrls: ['./monthly-income-chart.component.scss']
})
export class MonthlyIncomeChartComponent implements OnInit {
  @ViewChild('chartContainer') chartContainer!: ElementRef;

  selectedPeriod: 'week' | 'month' | 'quarter' = 'month';
  chartData: any[] = [];
  view: [number, number] = [700, 300];

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
    window.addEventListener('resize', () => this.updateChartDimensions());
  }

  updateChartDimensions(): void {
    if (this.chartContainer) {
      const containerWidth = this.chartContainer.nativeElement.offsetWidth;
      this.view = [containerWidth, 300];
    }
  }

  updateChart(): void {
    this.dashboardService.getFinancialOverview()
      .subscribe({
        next: (data) => {
          this.chartData = this.formatChartData(data);
        },
        error: (error) => console.error('Error loading chart data:', error)
      });
  }

  private formatChartData(data: any): any[] {
    const groupedData = data.payments.reduce((acc: any, payment: any) => {
      const date = new Date(payment.paymentDate).toLocaleDateString('ar-EG', {
        month: 'short',
        day: 'numeric'
      });
      
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += payment.amount;
      return acc;
    }, {});

    // Sort dates in reverse for RTL
    const sortedDates = Object.entries(groupedData)
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());

    return [{
      name: 'الدخل',
      series: sortedDates.map(([date, value]) => ({
        name: date,
        value: value
      }))
    }];
  }

  onSelect(event: any): void {
    console.log('Item clicked', event);
  }
}