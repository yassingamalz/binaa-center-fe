import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentsModule } from './payments/payments.module';
import { ShimmerDirective } from './directives/shimmer.directive';
import { NotificationListComponent } from './components/notification-list/notification-list.component';
import { NotificationDetailComponent } from './components/notification-detail/notification-detail.component';
import { UnderConstructionComponent } from './components/under-construction/under-construction.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { ForbiddenComponent } from './components/forbidden/forbidden.component';


@NgModule({
  declarations: [ShimmerDirective, NotificationListComponent, NotificationDetailComponent, UnderConstructionComponent, NotFoundComponent, ForbiddenComponent],
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
