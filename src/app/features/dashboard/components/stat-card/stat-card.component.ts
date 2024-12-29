// src/app/features/dashboard/components/stat-card/stat-card.component.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  templateUrl: './stat-card.component.html',
  styleUrls: ['./stat-card.component.scss']
})
export class StatCardComponent {
  @Input() value: number = 0;
  @Input() label: string = '';
  @Input() icon: string = '';
  @Input() colorClass: string = '';
  @Input() suffix: string = '';
  @Input() isLoading: boolean = false;
}

