// src/app/features/dashboard/components/payment-status/payment-status.component.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-payment-status',
  templateUrl: './payment-status.component.html',
  styleUrls: ['./payment-status.component.scss']
})
export class PaymentStatusComponent {
  @Input() icon: string = 'fas fa-chart-line';
  @Input() value: string | number = '0';
  @Input() label: string = '';
  @Input() unit: string = '';
  @Input() isPink: boolean = false;
}
