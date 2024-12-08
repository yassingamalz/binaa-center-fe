
// src/app/layout/components/header/header.component.ts
import { Component, EventEmitter, Input, Output, OnInit, HostListener } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { UserDTO } from '../../../../core/models/user';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() isSidebarCollapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();
  
  currentUser$: Observable<UserDTO | null>;
  searchQuery: string = '';
  showMobileSearch = false;
  isSearchActive = false;
  notificationCount = 3;
  
  notifications = [
    {
      icon: 'fas fa-calendar-check',
      iconClass: 'text-green-500',
      message: 'موعد جديد تم تأكيده',
      time: 'منذ 5 دقائق'
    },
    {
      icon: 'fas fa-coins',
      iconClass: 'text-yellow-500',
      message: 'تم استلام دفعة جديدة',
      time: 'منذ ساعة'
    },
    {
      icon: 'fas fa-user-plus',
      iconClass: 'text-blue-500',
      message: 'حالة جديدة تم تسجيلها',
      time: 'منذ ساعتين'
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    // Add shadow on scroll
    const header = document.querySelector('header');
    if (header) {
      if (window.scrollY > 0) {
        header.classList.add('shadow-md');
      } else {
        header.classList.remove('shadow-md');
      }
    }
  }

  ngOnInit(): void {
    this.checkMobileView();
  }

  toggleMobileSearch(): void {
    this.showMobileSearch = !this.showMobileSearch;
  }

  private checkMobileView(): void {
    if (window.innerWidth < 768) {
      this.showMobileSearch = false;
    }
  }

  onSearch(event: Event): void {
    event.preventDefault();
    if (this.searchQuery.trim()) {
      // Implement search logic
      console.log('Searching for:', this.searchQuery);
    }
  }

  onLogout(): void {
    this.authService.logout();
    this.toastr.success('تم تسجيل الخروج بنجاح');
    this.router.navigate(['/auth/login']);
  }
}