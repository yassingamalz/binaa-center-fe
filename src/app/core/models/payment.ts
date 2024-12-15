
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

export interface PaymentDTO {
  paymentId: number;
  caseId: number;
  caseName?: string;
  amount: number;
  paymentDate: Date;
  description?: string;
  paymentMethod: PaymentMethod;
  invoiceNumber: string;
  paymentStatus: PaymentStatus;
  discountAmount?: number;
  taxAmount?: number;
  createdBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaymentResponseDTO extends PaymentDTO {
  statusLabel?: string;
  methodLabel?: string;
  caseNumber?: string;
  totalAmount?: number;
}