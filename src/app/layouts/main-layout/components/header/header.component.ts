import { 
  Component, 
  EventEmitter, 
  Input, 
  Output, 
  OnInit, 
  OnDestroy, 
  ChangeDetectionStrategy, 
  ViewChild, 
  ElementRef 
} from '@angular/core';
import { Observable, Subject, fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { UserDTO } from '../../../../core/models/user';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() isSidebarCollapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  @ViewChild('header') headerElement!: ElementRef;
  @ViewChild('notificationDropdown') notificationDropdown!: NgbDropdown;

  currentUser$: Observable<UserDTO | null>;
  notifications$ = this.notificationService.notifications$;
  unreadCount$ = this.notificationService.unreadCount$;
  private destroy$ = new Subject<void>();

  isSearchActive = false;
  showMobileSearch = false;
  searchQuery = '';
  isScrolled = false;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
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

  onSearch(event: Event): void {
    event.preventDefault();
    if (!this.searchQuery.trim()) return;

    if (this.showMobileSearch) {
      this.showMobileSearch = false;
    }

    this.router.navigate(['/search'], {
      queryParams: { q: this.searchQuery.trim() }
    });

    this.searchQuery = '';
    this.isSearchActive = false;
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

  onLogout(): void {
    this.authService.logout();
    this.toastr.success('تم تسجيل الخروج بنجاح');
    this.router.navigate(['/auth/login']);
  }

  viewAllNotifications(): void {
    this.notificationDropdown.close();
    this.router.navigate(['/notifications']);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success('تم تعليم جميع الإشعارات كمقروءة');
          this.notificationDropdown.close();
        },
        error: (error) => {
          console.error('Error marking notifications as read:', error);
          this.toastr.error('حدث خطأ أثناء تحديث الإشعارات');
        }
      });
  }

  private initializeScrollListener(): void {
    fromEvent(window, 'scroll')
      .pipe(
        debounceTime(10),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.isScrolled = window.scrollY > 0;
        if (this.headerElement) {
          this.headerElement.nativeElement.classList.toggle('scrolled', this.isScrolled);
        }
      });
  }

  private initializeResizeListener(): void {
    fromEvent(window, 'resize')
      .pipe(
        debounceTime(100),
        takeUntil(this.destroy$)
      )
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

  formatUsername(username: string): string {
    return username
      .replace(/[._]/g, ' ')
      .trim();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}