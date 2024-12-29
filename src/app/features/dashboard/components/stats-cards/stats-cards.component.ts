// src/app/features/dashboard/components/stats-cards/stats-cards.component.ts
import { Component, Input } from '@angular/core';

export interface DashboardStats {
  activeCases: { length: number };
  todaysSessions: { totalSessions: number };
  monthlyFinance: { totalIncome: number };
  upcomingAssessments: { length: number };
}

@Component({
  selector: 'app-stats-cards',
  templateUrl: './stats-cards.component.html',
  styleUrls: ['./stats-cards.component.scss']
})
export class StatsCardsComponent {
  @Input() stats: DashboardStats = {
    activeCases: { length: 0 },
    todaysSessions: { totalSessions: 0 },
    monthlyFinance: { totalIncome: 0 },
    upcomingAssessments: { length: 0 }
  };
  @Input() isLoading = false;
}