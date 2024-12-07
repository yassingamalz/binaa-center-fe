import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentListComponent } from './components/payment-list/payment-list.component';
import { ExpenseListComponent } from './components/expense-list/expense-list.component';
import { InvoiceGeneratorComponent } from './components/invoice-generator/invoice-generator.component';



@NgModule({
  declarations: [
    PaymentListComponent,
    ExpenseListComponent,
    InvoiceGeneratorComponent
  ],
  imports: [
    CommonModule
  ]
})
export class FinanceModule { }
