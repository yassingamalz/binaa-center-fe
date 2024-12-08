import { PaymentMethod } from "./payment";

  
  // src/app/core/interfaces/expense.interface.ts
  export enum ExpenseCategory {
    SALARY = 'SALARY',
    RENT = 'RENT',
    UTILITIES = 'UTILITIES',
    SUPPLIES = 'SUPPLIES',
    MARKETING = 'MARKETING',
    MAINTENANCE = 'MAINTENANCE',
    OTHER = 'OTHER'
  }
  
  export interface ExpenseDTO {
    expenseId: number;
    category: ExpenseCategory;
    amount: number;
    date: Date;
    description?: string;
    receiptPath?: string;
    paidBy: number;
    paymentMethod: PaymentMethod;
  }