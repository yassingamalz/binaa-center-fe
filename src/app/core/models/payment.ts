
  // src/app/core/interfaces/payment.interface.ts
  export enum PaymentMethod {
    CASH = 'CASH',
    CARD = 'CARD',
    BANK = 'BANK'
  }
  
  export enum PaymentStatus {
    PAID = 'PAID',
    PENDING = 'PENDING',
    OVERDUE = 'OVERDUE'
  }
  
  export interface PaymentDTO {
    paymentId: number;
    caseId: number;
    sessionId?: number;
    amount: number;
    paymentDate: Date;
    description?: string;
    paymentMethod: PaymentMethod;
    invoiceNumber: string;
    paymentStatus: PaymentStatus;
    discountApplied?: number;
    taxAmount?: number;
  }