// src/app/features/fidelity/services/fidelity.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FidelityPointsDTO, PointsStatus, PointsTransactionType, RewardDTO, RewardStatus } from '../../../core/models/fidelity-point';
import { ApiService } from '../../../core/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class FidelityService {
  private pointsEndpoint = 'fidelity-points';
  private rewardsEndpoint = 'rewards';

  constructor(private apiService: ApiService) {}

  // Points Management
  createPoints(data: Omit<FidelityPointsDTO, 'pointId'>): Observable<FidelityPointsDTO> {
    return this.apiService.post<FidelityPointsDTO>(this.pointsEndpoint, data);
  }

  getPointsByCase(caseId: number): Observable<FidelityPointsDTO[]> {
    return this.apiService.get<FidelityPointsDTO[]>(`${this.pointsEndpoint}/case/${caseId}`);
  }

  getPointsByStatus(status: PointsStatus): Observable<FidelityPointsDTO[]> {
    return this.apiService.get<FidelityPointsDTO[]>(`${this.pointsEndpoint}/status/${status}`);
  }

  getPointsBalance(caseId: number): Observable<number> {
    return this.apiService.get<number>(`${this.pointsEndpoint}/balance/${caseId}`);
  }

  getPointsHistory(caseId: number): Observable<FidelityPointsDTO[]> {
    return this.apiService.get<FidelityPointsDTO[]>(`${this.pointsEndpoint}/history/${caseId}`);
  }

  addPoints(data: { 
    caseId: number; 
    points: number; 
    source: string; 
    expiryDate?: Date 
  }): Observable<FidelityPointsDTO> {
    return this.apiService.post<FidelityPointsDTO>(`${this.pointsEndpoint}/add`, {
      ...data,
      type: PointsTransactionType.EARN
    });
  }

  deductPoints(data: { 
    caseId: number; 
    points: number; 
    reason: string 
  }): Observable<FidelityPointsDTO> {
    return this.apiService.post<FidelityPointsDTO>(`${this.pointsEndpoint}/deduct`, {
      ...data,
      type: PointsTransactionType.REDEEM
    });
  }

  getPointsExpiringSoon(days: number = 30): Observable<FidelityPointsDTO[]> {
    return this.apiService.get<FidelityPointsDTO[]>(`${this.pointsEndpoint}/expiring/${days}`);
  }

  // Rewards Management
  createReward(data: Omit<RewardDTO, 'rewardId'>): Observable<RewardDTO> {
    return this.apiService.post<RewardDTO>(this.rewardsEndpoint, data);
  }

  getRewardById(rewardId: number): Observable<RewardDTO> {
    return this.apiService.get<RewardDTO>(`${this.rewardsEndpoint}/${rewardId}`);
  }

  getAllRewards(): Observable<RewardDTO[]> {
    return this.apiService.get<RewardDTO[]>(this.rewardsEndpoint);
  }

  getActiveRewards(): Observable<RewardDTO[]> {
    return this.apiService.get<RewardDTO[]>(`${this.rewardsEndpoint}/status/${RewardStatus.ACTIVE}`);
  }

  updateReward(rewardId: number, data: Partial<RewardDTO>): Observable<RewardDTO> {
    return this.apiService.put<RewardDTO>(`${this.rewardsEndpoint}/${rewardId}`, data);
  }

  deleteReward(rewardId: number): Observable<void> {
    return this.apiService.delete<void>(`${this.rewardsEndpoint}/${rewardId}`);
  }

  redeemReward(data: {
    caseId: number;
    rewardId: number;
    notes?: string;
  }): Observable<{
    success: boolean;
    pointsBalance: number;
    transaction: FidelityPointsDTO;
  }> {
    return this.apiService.post<any>(`${this.rewardsEndpoint}/redeem`, data);
  }

  // Redemption History
  getRedemptionHistory(caseId?: number): Observable<{
    rewardId: number;
    caseId: number;
    caseName: string;
    rewardName: string;
    pointsUsed: number;
    redeemedDate: Date;
    notes?: string;
  }[]> {
    const endpoint = caseId 
      ? `${this.rewardsEndpoint}/redemptions/case/${caseId}`
      : `${this.rewardsEndpoint}/redemptions`;
    return this.apiService.get(endpoint);
  }

  // Points Statistics
  getPointsStatistics(caseId?: number): Observable<{
    totalPointsEarned: number;
    totalPointsRedeemed: number;
    currentBalance: number;
    expiringPoints: number;
    lastEarnedDate?: Date;
    lastRedeemedDate?: Date;
  }> {
    const endpoint = caseId 
      ? `${this.pointsEndpoint}/statistics/${caseId}` 
      : `${this.pointsEndpoint}/statistics`;
    return this.apiService.get(endpoint);
  }

  // Program Settings
  getProgramSettings(): Observable<{
    pointsExpiryDays: number;
    minimumPointsToRedeem: number;
    pointsPerSession: number;
    bonusPointsThreshold: number;
    bonusPointsAmount: number;
  }> {
    return this.apiService.get(`${this.pointsEndpoint}/settings`);
  }

  updateProgramSettings(settings: {
    pointsExpiryDays?: number;
    minimumPointsToRedeem?: number;
    pointsPerSession?: number;
    bonusPointsThreshold?: number;
    bonusPointsAmount?: number;
  }): Observable<void> {
    return this.apiService.put(`${this.pointsEndpoint}/settings`, settings);
  }
}