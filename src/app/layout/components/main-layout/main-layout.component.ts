// src/app/layout/components/main-layout/main-layout.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingService } from '../../../core/services/loading.service';
import { UserDTO } from '../../../core/models/user';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  isSidebarCollapsed = false;
  currentUser$: Observable<UserDTO | null>;
  isLoading$: Observable<boolean>;
  private subscriptions: Subscription[] = [];
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private loadingService: LoadingService
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.isLoading$ = this.loadingService.isLoading$;
  }

  ngOnInit(): void {
    // Handle responsive breakpoints
    this.subscriptions.push(
      this.breakpointObserver
        .observe([Breakpoints.XSmall, Breakpoints.Small])
        .subscribe(result => {
          this.isSidebarCollapsed = result.matches;
        })
    );

    // Handle route changes
    this.subscriptions.push(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        // Close sidebar on mobile when navigating
        if (this.breakpointObserver.isMatched([Breakpoints.XSmall, Breakpoints.Small])) {
          this.isSidebarCollapsed = true;
        }
      })
    );

    // Check authentication status
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        if (!user && !this.isAuthRoute()) {
          this.router.navigate(['/auth/login']);
        }
      })
    );

    // Initial screen size check
    this.checkScreenSize();
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  private checkScreenSize(): void {
    this.isSidebarCollapsed = window.innerWidth < 768;
  }

  private isAuthRoute(): boolean {
    return this.router.url.includes('/auth/');
  }
}