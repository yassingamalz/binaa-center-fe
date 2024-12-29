// src/app/core/interfaces/payment.interface.ts
export enum PaymentStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
  OVERDUE = 'OVERDUE'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  BANK = 'BANK'
}

/**
 * Base payment interface used for creating/updating payments
 */
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
  discountAmount?: number;
  taxAmount?: number;
}

/**
 * Extended payment interface with additional fields returned from the server
 */
export interface PaymentResponseDTO extends PaymentDTO {
  caseName: string;
  statusLabel?: string;
  methodLabel?: string;
  caseNumber?: string;
  totalAmount?: number;
  createdBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Payment method labels for display
 */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: 'نقدي',
  [PaymentMethod.CARD]: 'بطاقة',
  [PaymentMethod.BANK]: 'تحويل بنكي'
};

/**
 * Payment status labels for display
 */
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.PAID]: 'مدفوع',
  [PaymentStatus.PENDING]: 'معلق',
  [PaymentStatus.OVERDUE]: 'متأخر'
};