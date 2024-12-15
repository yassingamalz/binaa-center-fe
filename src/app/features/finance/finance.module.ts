import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaymentListComponent } from './components/payment-list/payment-list.component';
import { ExpenseListComponent } from './components/expense-list/expense-list.component';
import { InvoiceGeneratorComponent } from './components/invoice-generator/invoice-generator.component';
import { ExpenseFormComponent } from './components/expense-form/expense-form.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'payments',
        component: PaymentListComponent
      },
      {
        path: 'expenses',
        component: ExpenseListComponent
      },
      {
        path: 'invoices',
        component: InvoiceGeneratorComponent
      },
      {
        path: '',
        redirectTo: 'payments',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  declarations: [
    PaymentListComponent,
    ExpenseListComponent,
    InvoiceGeneratorComponent,
    ExpenseFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class FinanceModule { }