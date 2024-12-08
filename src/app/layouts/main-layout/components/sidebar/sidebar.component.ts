// src/app/layout/components/sidebar/sidebar.component.ts
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  children?: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() isCollapsed = false;

  menuItems: MenuItem[] = [
    { icon: 'fa-home', label: 'لوحة التحكم', route: '/dashboard' },
    { icon: 'fa-users', label: 'إدارة الحالات', route: '/cases' },
    { icon: 'fa-calendar', label: 'المواعيد', route: '/appointments' },
    { icon: 'fa-clipboard', label: 'الجلسات', route: '/sessions' },
    { icon: 'fa-chart-bar', label: 'التقييمات', route: '/assessments' },
    { icon: 'fa-file-alt', label: 'المستندات', route: '/documents' },
    { icon: 'fa-money-bill', label: 'المالية', route: '/finance' },
    { icon: 'fa-star', label: 'برنامج الولاء', route: '/fidelity' },
    { icon: 'fa-chart-line', label: 'التقارير', route: '/reports' },
    { icon: 'fa-cog', label: 'الإعدادات', route: '/settings' }
  ];

  constructor(private router: Router) {}

  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }
}