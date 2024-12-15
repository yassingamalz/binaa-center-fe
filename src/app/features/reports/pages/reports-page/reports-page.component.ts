//src\app\features\reports\pages\reports-page\reports-page.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-reports-page',
  templateUrl: './reports-page.component.html',
  styleUrls: ['./reports-page.component.scss']
})
export class ReportsPageComponent {
  activeTab: 'case' | 'financial' | 'staff' = 'case';

  switchTab(tab: 'case' | 'financial' | 'staff'): void {
    this.activeTab = tab;
  }
}