// src/app/features/fidelity/services/fidelity.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FidelityPointsDTO, PointsStatus, RewardDTO, RewardStatus } from '../../../core/models/fidelity-point';
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

  // Rewards Management
  getActiveRewards(): Observable<RewardDTO[]> {
    return this.apiService.get<RewardDTO[]>(`${this.rewardsEndpoint}/status/${RewardStatus.ACTIVE}`);
  }

  redeemReward(pointsId: number, rewardId: number): Observable<any> {
    return this.apiService.post<any>(`${this.rewardsEndpoint}/redeem`, {
      pointsId,
      rewardId
    });
  }
}