// src/app/layout/components/sidebar/sidebar.component.ts
import { Component, Input } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { filter } from 'rxjs';

interface MenuItem {
  icon: string;
  label: string;
  route?: string;
  children?: MenuItem[];
  isExpanded?: boolean;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  animations: [
    trigger('submenuAnimation', [
      state('collapsed', style({
        height: '0',
        opacity: '0',
        overflow: 'hidden'
      })),
      state('expanded', style({
        height: '*',
        opacity: '1'
      })),
      transition('collapsed <=> expanded', animate('300ms ease'))
    ])
  ]
})
export class SidebarComponent {
  @Input() isCollapsed = false;

  menuItems: MenuItem[] = [
    {
      icon: 'fa-home',
      label: 'لوحة التحكم',
      route: '/dashboard'
    },
    {
      icon: 'fa-users',
      label: 'إدارة الحالات',
      route: '/cases'
    },
    {
      icon: 'fa-calendar',
      label: 'المواعيد',
      route: '/appointments'
    },
    {
      icon: 'fa-clipboard',
      label: 'الجلسات',
      route: '/sessions'
    },
    {
      icon: 'fa-chart-bar',
      label: 'التقييمات',
      route: '/assessments'
    },
    {
      icon: 'fa-file-alt',
      label: 'المستندات',
      route: '/documents'
    },
    {
      icon: 'fa-money-bill',
      label: 'المالية',
      isExpanded: false,
      children: [
        {
          icon: 'fa-hand-holding-dollar',
          label: 'المدفوعات',
          route: '/finance/payments'
        },
        {
          icon: 'fa-file-invoice-dollar',
          label: 'المصروفات',
          route: '/finance/expenses'
        }
      ]
    },
    {
      icon: 'fa-star',
      label: 'برنامج الولاء',
      isExpanded: false,
      children: [
        {
          icon: 'fa-gift',
          label: 'المكافآت',
          route: '/fidelity/rewards'
        },
        {
          icon: 'fa-history',
          label: 'سجل النقاط',
          route: '/fidelity/points-history'
        }
      ]
    },
    {
      icon: 'fa-chart-line',
      label: 'التقارير',
      isExpanded: false,
      children: [
        {
          icon: 'fa-users',
          label: 'تقارير الحالات',
          route: '/reports/cases'
        },
        {
          icon: 'fa-chart-line',
          label: 'التقارير المالية',
          route: '/reports/financial'
        },
        {
          icon: 'fa-user-md',
          label: 'تقارير الموظفين',
          route: '/reports/staff'
        }
      ]
    },
    {
      icon: 'fa-cog',
      label: 'الإعدادات',
      route: '/settings'
    }
  ];

  constructor(private router: Router) { }

  ngOnInit() {
    // Listen to router events to automatically collapse submenus
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.collapseUnusedSubmenus();
    });
  }
  
  collapseUnusedSubmenus() {
    this.menuItems.forEach(item => {
      if (item.children) {
        // Check if any child is active
        const hasActiveChild = item.children.some(child => 
          child.route && this.router.url.startsWith(child.route)
        );
  
        // Collapse the submenu if no child is active
        if (!hasActiveChild) {
          item.isExpanded = false;
        }
      }
    });
  }

  isActive(route: string | undefined): boolean {
    if (!route) return false;

    if (route === '/') {
      return this.router.url === '/';
    }

    return this.router.url.startsWith(route);
  }

  hasActiveChild(item: MenuItem): boolean {
    if (!item.children) return false;

    return item.children.some(child =>
      child.route && this.router.url.startsWith(child.route)
    );
  }

  toggleSubmenu(item: MenuItem, event?: Event): void {
    if (event) {
      event.preventDefault();
    }

    if (!this.isCollapsed && item.children) {
      item.isExpanded = !item.isExpanded;
    }
  }

  shouldShowSubmenu(item: MenuItem): boolean {
    return !this.isCollapsed &&
      item.children !== undefined &&
      item.children.length > 0 &&
      item.isExpanded === true;
  }

  getRouterLink(item: MenuItem): string[] | null {
    return item.route ? [item.route] : null;
  }
}