// src/app/shared/components/notification-list/notification-list.component.ts
import { 
  Component, 
  OnInit, 
  OnDestroy, 
  ChangeDetectionStrategy 
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { trigger, transition, style, animate } from '@angular/animations';
import { 
  NotificationType, 
  NotificationResponse, 
  NotificationStatus, 
  NotificationAction 
} from '../../../core/models/notification.interface';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeSlideOut', [
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class NotificationListComponent implements OnInit, OnDestroy {
  // Enum for type safety
  readonly NotificationType = NotificationType;

  // Destroy subject for proper RxJS subscription management
  private destroy$ = new Subject<void>();

  // Notifications observable
  notifications$: Observable<NotificationResponse[]>;

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private toastr: ToastrService
  ) {
    // Create a read-only observable of notifications
    this.notifications$ = this.notificationService.notifications$;
  }

  ngOnInit(): void {
    // Load notifications on component initialization
    this.loadNotifications();
  }

  // Method to load notifications
  loadNotifications(): void {
    this.notificationService.loadNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (error) => {
          console.error('Error loading notifications:', error);
          this.toastr.error('حدث خطأ أثناء تحميل الإشعارات');
        }
      });
  }

  // Tracking method for *ngFor performance optimization
  trackByNotificationId(index: number, notification: NotificationResponse): number {
    return notification.notificationId;
  }

  // Get icon based on notification type
  getTypeIcon(type: NotificationType): string {
    const icons = {
      [NotificationType.SESSION]: 'calendar-check',
      [NotificationType.PAYMENT]: 'coins',
      [NotificationType.ASSESSMENT]: 'clipboard-list',
      [NotificationType.CASE]: 'user-plus',
      [NotificationType.SYSTEM]: 'bell'
    };
    return icons[type] || 'bell';
  }

  // Get label based on notification type
  getTypeLabel(type: NotificationType): string {
    const labels = {
      [NotificationType.SESSION]: 'جلسة',
      [NotificationType.PAYMENT]: 'دفع',
      [NotificationType.ASSESSMENT]: 'تقييم',
      [NotificationType.CASE]: 'حالة',
      [NotificationType.SYSTEM]: 'نظام'
    };
    return labels[type] || 'نظام';
  }

  // Handle notification click
  onNotificationClick(notification: NotificationResponse): void {
    // Mark as read if unread
    if (notification.status === NotificationStatus.UNREAD) {
      this.markAsRead(notification);
    }
    
    // Navigate to notification source
    this.navigateToNotification(notification);
  }

  // Mark a single notification as read
  markAsRead(notification: NotificationResponse): void {
    if (notification.status === NotificationStatus.READ) return;

    this.notificationService.performAction({
      action: NotificationAction.MARK_READ,
      notificationIds: [notification.notificationId]
    }).pipe(takeUntil(this.destroy$))
    .subscribe({
      error: (error) => {
        console.error('Error marking notification as read:', error);
        this.toastr.error('حدث خطأ أثناء تحديث حالة الإشعار');
      }
    });
  }

  // Navigate to the appropriate route based on notification type
  private navigateToNotification(notification: NotificationResponse): void {
    const routes: { [key in NotificationType]?: string } = {
      [NotificationType.SESSION]: `/sessions/${notification.notificationId}`,
      [NotificationType.PAYMENT]: `/finance/payments/${notification.notificationId}`,
      [NotificationType.ASSESSMENT]: `/assessments/${notification.notificationId}`,
      [NotificationType.CASE]: `/cases/${notification.notificationId}`,
      [NotificationType.SYSTEM]: undefined
    };
  
    const route = routes[notification.type];
    if (route) {
      this.router.navigate([route]);
    }
  }

  deleteNotification(notification: NotificationResponse): void {
    this.notificationService.performAction({
      action:NotificationAction.DELETE,
      notificationIds: [notification.notificationId]
    }).pipe(takeUntil(this.destroy$))
    .subscribe({
      error: (error) => {
        console.error('Error deleting notification:', error);
        this.toastr.error('حدث خطأ أثناء حذف الإشعار');
      }
    });
  }

  // Clean up subscriptions
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}