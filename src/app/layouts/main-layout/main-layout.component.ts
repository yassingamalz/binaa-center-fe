import { 
  Component, 
  OnInit, 
  OnDestroy, 
  HostListener, 
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  HostBinding
} from '@angular/core';
import { Router, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { UserDTO } from '../../core/models/user';
import { AuthService } from '../../core/services/auth.service';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  // ViewChild References
  @ViewChild('mainContent') mainContent!: ElementRef;
  
  // Observable Streams
  currentUser$: Observable<UserDTO | null>;
  isLoading$: Observable<boolean>;
  
  // UI State
  isSidebarCollapsed = true;
  isSidebarVisible = false;
  isScrolled = false;
  isMobileView = false;
  
  // Route Management
  currentRoute: string = '';
  previousRoute: string = '';
  
  // Mobile Breakpoints
  readonly mobileBreakpoints = [Breakpoints.XSmall, Breakpoints.Small];
  
  // Cleanup Subject
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private loadingService: LoadingService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.isLoading$ = this.loadingService.isLoading$;
  }

  ngOnInit(): void {
    this.initializeLayout();
    this.setupSubscriptions();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }


  @HostBinding('class.sidebar-open') 
  get isSidebarOpen(): boolean {
    return !this.isSidebarCollapsed && this.isMobileView;
  }
  
  // Window Scroll Handler
  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 0;
    this.cdr.detectChanges();
  }

  // Window Resize Handler
  @HostListener('window:resize')
  onWindowResize(): void {
    this.checkMobileView();
  }

  // ESC Key Handler
  @HostListener('window:keydown.escape')
  onEscapeKey(): void {
    if (this.isMobileView && !this.isSidebarCollapsed) {
      this.toggleSidebar();
    }
  }

  // Initialize Layout Settings
  private initializeLayout(): void {
    this.checkMobileView();
    this.currentRoute = this.router.url;
    
    // Set initial sidebar state
    this.isSidebarCollapsed = this.isMobileView;
  }

  // Setup All Subscriptions
  private setupSubscriptions(): void {
    // Breakpoint Observer
    this.breakpointObserver
      .observe(this.mobileBreakpoints)
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isMobileView = result.matches;
        this.handleMobileBreakpoint();
      });

    // Route Changes
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(event => {
        this.handleRouteChange(event);
      });

    // Loading State
    this.isLoading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isLoading => {
        this.handleLoadingState(isLoading);
      });
  }

  // Mobile Breakpoint Handler
  private handleMobileBreakpoint(): void {
    if (this.isMobileView) {
      this.isSidebarCollapsed = true;
      this.isSidebarVisible = false;
    }
    this.cdr.detectChanges();
  }

  // Route Change Handler
  private handleRouteChange(event: NavigationEnd): void {
    this.previousRoute = this.currentRoute;
    this.currentRoute = event.urlAfterRedirects;

    if (this.isMobileView) {
      this.isSidebarCollapsed = true;
      this.isSidebarVisible = false;
    }

    // Scroll to top on route change
    this.scrollToTop();
    this.cdr.detectChanges();
  }

  // Loading State Handler
  private handleLoadingState(isLoading: boolean): void {
    if (isLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  // Check Mobile View
  private checkMobileView(): void {
    this.isMobileView = this.breakpointObserver.isMatched(this.mobileBreakpoints);
    this.cdr.detectChanges();
  }

  // Toggle Sidebar
  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    
    if (this.isMobileView) {
      if (!this.isSidebarCollapsed) {
        document.body.classList.add('sidebar-open');
      } else {
        document.body.classList.remove('sidebar-open');
      }
    }
  }

  // Close Sidebar
  closeSidebar(): void {
    if (this.isMobileView && !this.isSidebarCollapsed) {
      this.isSidebarCollapsed = true;
      this.isSidebarVisible = false;
      document.body.style.overflow = '';
      this.cdr.detectChanges();
    }
  }

  // Scroll to Top
  scrollToTop(smooth: boolean = true): void {
    if (this.mainContent?.nativeElement) {
      this.mainContent.nativeElement.scrollTo({
        top: 0,
        behavior: smooth ? 'smooth' : 'auto'
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  }

  // Get current route depth (for animations)
  getRouteDepth(): number {
    return this.currentRoute.split('/').length - 1;
  }

  // Get animation direction
  getAnimationDirection(): 'forward' | 'backward' {
    const currentDepth = this.getRouteDepth();
    const previousDepth = this.previousRoute.split('/').length - 1;
    return currentDepth > previousDepth ? 'forward' : 'backward';
  }

  // Check if route is active
  isRouteActive(route: string): boolean {
    return this.currentRoute.startsWith(route);
  }

  // Cleanup
  private cleanup(): void {
    document.body.style.overflow = '';
    this.destroy$.next();
    this.destroy$.complete();

    document.body.classList.remove('sidebar-open');
    this.destroy$.next();
    this.destroy$.complete();

  }
}