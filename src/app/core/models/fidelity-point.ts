// src/app/core/interfaces/fidelity.interface.ts
export enum PointsTransactionType {
    EARN = 'EARN',
    REDEEM = 'REDEEM'
  }
  
  export enum PointsStatus {
    ACTIVE = 'ACTIVE',
    USED = 'USED',
    EXPIRED = 'EXPIRED'
  }
  
  export enum RewardStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
  }
  
  export interface FidelityPointsDTO {
    pointId: number;
    caseId: number;
    points: number;
    transactionDate: Date;
    type: PointsTransactionType;
    source?: string;
    expiryDate?: Date;
    status: PointsStatus;
  }
  
  export interface RewardDTO {
    rewardId: number;
    name: string;
    pointsRequired: number;
    description?: string;
    validUntil: Date;
    status: RewardStatus;
  }