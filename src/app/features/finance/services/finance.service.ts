// src/app/features/finance/services/finance.service.ts
import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { ExpenseCategory, ExpenseDTO } from '../../../core/models/expense';
import { PaymentDTO, PaymentStatus } from '../../../core/models/payment';
import { ApiService } from '../../../core/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  private paymentsEndpoint = 'payments';
  private expensesEndpoint = 'expenses';

  constructor(private apiService: ApiService) {}

  // Financial Summary
  getFinancialSummary(startDate: Date, endDate: Date): Observable<any> {
    return forkJoin({
      payments: this.getPaymentsByDateRange(startDate, endDate),
      expenses: this.getExpensesByDateRange(startDate, endDate)
    }).pipe(
      map(({ payments, expenses }) => {
        const totalIncome = payments.reduce((sum, payment) => sum + payment.amount, 0);
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        
        return {
          totalIncome,
          totalExpenses,
          netIncome: totalIncome - totalExpenses,
          payments,
          expenses
        };
      })
    );
  }

  // Payments
  getPaymentsByDateRange(startDate: Date, endDate: Date): Observable<PaymentDTO[]> {
    return this.apiService.get<PaymentDTO[]>(`${this.paymentsEndpoint}/dateRange`, {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    });
  }

  getOverduePayments(): Observable<PaymentDTO[]> {
    return this.apiService.get<PaymentDTO[]>(`${this.paymentsEndpoint}/status/${PaymentStatus.OVERDUE}`);
  }

  // Expenses
  getExpensesByCategory(category: ExpenseCategory): Observable<ExpenseDTO[]> {
    return this.apiService.get<ExpenseDTO[]>(`${this.expensesEndpoint}/category/${category}`);
  }

  getExpensesByDateRange(startDate: Date, endDate: Date): Observable<ExpenseDTO[]> {
    return this.apiService.get<ExpenseDTO[]>(`${this.expensesEndpoint}/dateRange`, {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    });
  }

  getBudgetAnalysis(month: number, year: number): Observable<any> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    return this.getFinancialSummary(startDate, endDate).pipe(
      map(summary => ({
        ...summary,
        budgetStatus: summary.netIncome >= 0 ? 'Within Budget' : 'Over Budget',
        variance: summary.netIncome
      }))
    );
  }
}