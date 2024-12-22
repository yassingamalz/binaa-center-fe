import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NotificationResponse, NotificationType, NotificationAction } from '../../../core/models/notification.interface';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-detail',
  templateUrl: './notification-detail.component.html',
  styleUrls: ['./notification-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationDetailComponent implements OnInit {
  @Input() notification!: NotificationResponse;
  notificationTypes = NotificationType;

  private readonly notificationRoutes: Record<NotificationType, string> = {
    [NotificationType.SESSION]: '/sessions',
    [NotificationType.PAYMENT]: '/finance/payments',
    [NotificationType.ASSESSMENT]: '/assessments',
    [NotificationType.CASE]: '/cases',
    [NotificationType.SYSTEM]: ''
  };

  constructor(
    private activeModal: NgbActiveModal,
    private notificationService: NotificationService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Mark as read if unread
    if (this.notification.status === 'UNREAD') {
      this.markAsRead();
    }
  }

  private markAsRead(): void {
    this.notificationService.performAction({
      notificationIds: [this.notification.notificationId],
      action: NotificationAction.MARK_READ
    }).subscribe({
      error: (error) => {
        console.error('Error marking notification as read:', error);
      }
    });
  }

  dismiss(): void {
    this.activeModal.dismiss();
  }

  close(): void {
    this.activeModal.close();
  }

  navigateToTarget(): void {
    const route = this.getTargetRoute();
    if (route) {
      this.activeModal.close();
      this.router.navigate([route]);
    }
  }

  private getTargetRoute(): string | null {
    const baseRoute = this.notificationRoutes[this.notification.type];
    if (!baseRoute) return null;

    // Add ID to route if exists in notification data
    const idMap: Record<NotificationType, string> = {
      [NotificationType.SESSION]: 'sessionId',
      [NotificationType.PAYMENT]: 'paymentId',
      [NotificationType.ASSESSMENT]: 'assessmentId',
      [NotificationType.CASE]: 'caseId',
      [NotificationType.SYSTEM]: ''
    };

    const idKey = idMap[this.notification.type];
    const id = this.notification.data?.[idKey];

    return id ? `${baseRoute}/${id}` : null;
  }

  archiveNotification(): void {
    this.notificationService.performAction({
      notificationIds: [this.notification.notificationId],
      action: NotificationAction.ARCHIVE
    }).subscribe({
      next: () => {
        this.toastr.success('تم أرشفة الإشعار بنجاح');
        this.activeModal.close();
      },
      error: (error) => {
        console.error('Error archiving notification:', error);
        this.toastr.error('حدث خطأ أثناء أرشفة الإشعار');
      }
    });
  }

  deleteNotification(): void {
    if (confirm('هل أنت متأكد من حذف هذا الإشعار؟')) {
      this.notificationService.performAction({
        notificationIds: [this.notification.notificationId],
        action: NotificationAction.DELETE
      }).subscribe({
        next: () => {
          this.toastr.success('تم حذف الإشعار بنجاح');
          this.activeModal.close();
        },
        error: (error) => {
          console.error('Error deleting notification:', error);
          this.toastr.error('حدث خطأ أثناء حذف الإشعار');
        }
      });
    }
  }

  getTypeLabel(type: NotificationType): string {
    const labels: Record<NotificationType, string> = {
      [NotificationType.SESSION]: 'جلسة',
      [NotificationType.PAYMENT]: 'دفع',
      [NotificationType.ASSESSMENT]: 'تقييم',
      [NotificationType.CASE]: 'حالة',
      [NotificationType.SYSTEM]: 'النظام'
    };
    return labels[type] || type;
  }

  getFormattedDate(date: Date | undefined): string {
    if (!date) return '';
    
    return new Date(date).toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  hasTargetRoute(): boolean {
    return this.notification.type !== NotificationType.SYSTEM && !!this.getTargetRoute();
  }

  getJsonData(): string {
    return JSON.stringify(this.notification.data, null, 2);
  }

  isDataObject(): boolean {
    return this.notification.data !== null && 
           typeof this.notification.data === 'object' && 
           Object.keys(this.notification.data).length > 0;
  }
}