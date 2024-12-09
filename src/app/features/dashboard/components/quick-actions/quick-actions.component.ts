// src/app/features/dashboard/components/quick-actions/quick-actions.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-quick-actions',
  templateUrl: './quick-actions.component.html',
  styleUrls: ['./quick-actions.component.scss']
})
export class QuickActionsComponent {
  constructor(private router: Router) {}

  addNewCase(): void {
    this.router.navigate(['/cases/new']);
  }

  scheduleSession(): void {
    this.router.navigate(['/sessions/schedule']);
  }

  recordPayment(): void {
    this.router.navigate(['/finance/payments/new']);
  }

  createReport(): void {
    this.router.navigate(['/reports/new']);
  }
}