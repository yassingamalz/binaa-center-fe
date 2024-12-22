import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentsModule } from './payments/payments.module';
import { ShimmerDirective } from './directives/shimmer.directive';
import { NotificationListComponent } from './components/notification-list/notification-list.component';
import { NotificationDetailComponent } from './components/notification-detail/notification-detail.component';



@NgModule({
  declarations: [ShimmerDirective, NotificationListComponent, NotificationDetailComponent],
  imports: [
    CommonModule,
    PaymentsModule
  ],
  exports: [
    ShimmerDirective,
    NotificationDetailComponent,
    NotificationListComponent
  ]
})
export class SharedModule { }
