// src/app/features/finance/services/finance.service.ts
import { Injectable } from '@angular/core';
import { Observable, forkJoin, from, map } from 'rxjs';
import { ExpenseCategory, ExpenseDTO } from '../../../core/models/expense';
import { PaymentDTO, PaymentResponseDTO, PaymentStatus } from '../../../core/models/payment';
import { ApiService } from '../../../core/services/api.service';
import { HttpResponse } from '@angular/common/http';

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
  getAllPayments(): Observable<PaymentResponseDTO[]> {
    return this.apiService.get<PaymentResponseDTO[]>(this.paymentsEndpoint);
  }

  getPaymentById(id: number): Observable<PaymentResponseDTO> {
    return this.apiService.get<PaymentResponseDTO>(`${this.paymentsEndpoint}/${id}`);
  }

  createPayment(data: Omit<PaymentDTO, 'paymentId'>): Observable<PaymentResponseDTO> {
    return this.apiService.post<PaymentResponseDTO>(this.paymentsEndpoint, data);
  }

  updatePayment(paymentId: number, data: Partial<PaymentDTO>): Observable<PaymentResponseDTO> {
    return this.apiService.put<PaymentResponseDTO>(`${this.paymentsEndpoint}/${paymentId}`, data);
  }

  getPaymentsByStatus(status: PaymentStatus): Observable<PaymentResponseDTO[]> {
    return this.apiService.get<PaymentResponseDTO[]>(`${this.paymentsEndpoint}/status/${status}`);
  }

  getPaymentsByCase(caseId: number): Observable<PaymentResponseDTO[]> {
    return this.apiService.get<PaymentResponseDTO[]>(`${this.paymentsEndpoint}/case/${caseId}`);
  }

  getPaymentsByDateRange(startDate: Date, endDate: Date): Observable<PaymentResponseDTO[]> {
    return this.apiService.get<PaymentResponseDTO[]>(`${this.paymentsEndpoint}/by-date-range`, {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    });
  }


  // Expenses
  getExpensesByCategory(category: ExpenseCategory): Observable<ExpenseDTO[]> {
    return this.apiService.get<ExpenseDTO[]>(`${this.expensesEndpoint}/category/${category}`);
  }

  getExpensesByDateRange(startDate: Date, endDate: Date): Observable<ExpenseDTO[]> {
    return this.apiService.get<ExpenseDTO[]>(`${this.expensesEndpoint}/by-date-range`, {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
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


  generateReceipt(paymentId: number): Observable<HttpResponse<Blob>> {
    return this.apiService.getBlob(`${this.paymentsEndpoint}/${paymentId}/receipt`);
  }

  private async handleReceiptGeneration(paymentId: number): Promise<boolean> {
    try {
      const response = await this.apiService
        .getBlob(`${this.paymentsEndpoint}/${paymentId}/receipt`)
        .toPromise();
  
      if (response && response.body) {
        const contentDisposition = response.headers.get('content-disposition');
        const filename = contentDisposition
          ? contentDisposition.split('filename=')[1].trim().replace(/"/g, '')
          : `payment-receipt-${paymentId}.pdf`;
  
        const blob = new Blob([response.body], { 
          type: response.headers.get('content-type') || 'application/pdf' 
        });
  
        // Create URL and try to open print window
        const url = window.URL.createObjectURL(blob);
        const printWindow = window.open(url);
        
        if (printWindow) {
          printWindow.onload = function() {
            printWindow.print();
            window.URL.revokeObjectURL(url);
          };
        } else {
          // Fallback to download if popup is blocked
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }
  
        return true;
      }
      return false;
    } catch (error) {
      console.error('Receipt generation failed:', error);
      throw error;
    }
  }

  // Delete payment
  deletePayment(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.paymentsEndpoint}/${id}`);
  }

  // Get payment statistics
  getPaymentStatistics(): Observable<any> {
    return this.apiService.get<any>(`${this.paymentsEndpoint}/statistics`);
  }

  // Get pending payments
  getPendingPayments(): Observable<PaymentDTO[]> {
    return this.getPaymentsByStatus(PaymentStatus.PENDING);
  }

  // Create invoice
  createInvoice(paymentId: number): Observable<HttpResponse<Blob>> {
    return this.apiService.getBlob(`${this.paymentsEndpoint}/${paymentId}/invoice`);
  }


  // Add expense
  createExpense(data: Omit<ExpenseDTO, 'expenseId'>): Observable<ExpenseDTO> {
    return this.apiService.post<ExpenseDTO>(this.expensesEndpoint, data);
  }

  // Update expense
  updateExpense(expenseId: number, data: Partial<ExpenseDTO>): Observable<ExpenseDTO> {
    return this.apiService.put<ExpenseDTO>(`${this.expensesEndpoint}/${expenseId}`, data);
  }

  // Delete expense
  deleteExpense(expenseId: number): Observable<void> {
    return this.apiService.delete<void>(`${this.expensesEndpoint}/${expenseId}`);
  }

  // Get all expenses
  getAllExpenses(): Observable<ExpenseDTO[]> {
    return this.apiService.get<ExpenseDTO[]>(this.expensesEndpoint);
  }

  // Get expense by id 
  getExpenseById(id: number): Observable<ExpenseDTO> {
    return this.apiService.get<ExpenseDTO>(`${this.expensesEndpoint}/${id}`);
  }
}