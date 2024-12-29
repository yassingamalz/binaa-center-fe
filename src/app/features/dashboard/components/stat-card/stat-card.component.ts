// src/app/features/dashboard/components/stat-card/stat-card.component.ts
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  templateUrl: './stat-card.component.html',
  styleUrls: ['./stat-card.component.scss']
})
export class StatCardComponent implements OnInit {
  @Input() value: number = 0;
  @Input() label: string = '';
  @Input() icon: string = '';
  @Input() colorClass: string = '';
  @Input() suffix: string = '';
  @Input() isLoading: boolean = false;

  showContent: boolean = false;

  ngOnInit() {
    // Simulate a delay before showing the real content
    setTimeout(() => {
      this.showContent = true;
    }, 1000); // Delay of 1 second
  }
}