// src/app/layout/components/header/header.component.ts
import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription, fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserDTO } from '../../../../core/models/user';
import { AuthService } from '../../../../core/services/auth.service';

interface Notification {
  icon: string;
  iconClass: string;
  message: string;
  time: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() isSidebarCollapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();
  
  // Observables
  currentUser$: Observable<UserDTO | null>;
  private scrollSubscription?: Subscription;
  private resizeSubscription?: Subscription;

  // State
  isSearchActive = false;
  showMobileSearch = false;
  notificationCount = 3;
  searchQuery = '';
  
  notifications: Notification[] = [
    {
      icon: 'fas fa-calendar-check',
      iconClass: 'text-success',
      message: 'موعد جديد تم تأكيده',
      time: 'منذ 5 دقائق'
    },
    {
      icon: 'fas fa-coins',
      iconClass: 'text-warning',
      message: 'تم استلام دفعة جديدة',
      time: 'منذ ساعة'
    },
    {
      icon: 'fas fa-user-plus',
      iconClass: 'text-info',
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

  ngOnInit(): void {
    this.initializeScrollListener();
    this.initializeResizeListener();
    this.checkMobileView();
  }

  ngOnDestroy(): void {
    this.scrollSubscription?.unsubscribe();
    this.resizeSubscription?.unsubscribe();
  }

  onSearch(event: Event): void {
    event.preventDefault();
    if (this.searchQuery.trim()) {
      console.log('Searching for:', this.searchQuery);
      // Implement search logic here
      // You might want to emit an event or call a service
    }
  }

  onLogout(): void {
    this.authService.logout();
    this.toastr.success('تم تسجيل الخروج بنجاح');
    this.router.navigate(['/auth/login']);
  }

  toggleMobileSearch(): void {
    this.showMobileSearch = !this.showMobileSearch;
    if (this.showMobileSearch) {
      setTimeout(() => {
        const searchInput = document.querySelector('.mobile-search input');
        if (searchInput instanceof HTMLElement) {
          searchInput.focus();
        }
      }, 100);
    }
  }

  private initializeScrollListener(): void {
    this.scrollSubscription = fromEvent(window, 'scroll')
      .pipe(debounceTime(10))
      .subscribe(() => {
        const header = document.querySelector('.header');
        if (header) {
          if (window.scrollY > 0) {
            header.classList.add('scrolled');
          } else {
            header.classList.remove('scrolled');
          }
        }
      });
  }

  private initializeResizeListener(): void {
    this.resizeSubscription = fromEvent(window, 'resize')
      .pipe(debounceTime(100))
      .subscribe(() => {
        this.checkMobileView();
      });
  }

  private checkMobileView(): void {
    const isMobile = window.innerWidth < 768;
    if (isMobile && this.showMobileSearch) {
      this.showMobileSearch = false;
    }
  }
}