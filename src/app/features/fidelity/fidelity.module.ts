import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PointsHistoryComponent } from './components/points-history/points-history.component';
import { RewardsListComponent } from './components/rewards-list/rewards-list.component';
import { RewardFormComponent } from './components/reward-form/reward-form.component';
import { RedeemRewardComponent } from './components/redeem-reward/redeem-reward.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  {
    path: '',
    children: [
      { 
        path: 'rewards', 
        component: RewardsListComponent,
        canActivate: [AuthGuard]
      },
      { 
        path: 'points-history', 
        component: PointsHistoryComponent,
        canActivate: [AuthGuard]
      },
      {
        path: '',
        redirectTo: 'rewards',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  declarations: [
    PointsHistoryComponent,
    RewardsListComponent,
    RewardFormComponent,
    RedeemRewardComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  providers: []
})
export class FidelityModule { }