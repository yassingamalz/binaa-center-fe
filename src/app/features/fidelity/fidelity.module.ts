import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PointsHistoryComponent } from './components/points-history/points-history.component';
import { RewardsListComponent } from './components/rewards-list/rewards-list.component';



@NgModule({
  declarations: [
    PointsHistoryComponent,
    RewardsListComponent
  ],
  imports: [
    CommonModule
  ]
})
export class FidelityModule { }
