import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentsModule } from './payments/payments.module';
import { ShimmerDirective } from './directives/shimmer.directive';



@NgModule({
  declarations: [ShimmerDirective],
  imports: [
    CommonModule,
    PaymentsModule
  ],
  exports: [ShimmerDirective]
})
export class SharedModule { }
