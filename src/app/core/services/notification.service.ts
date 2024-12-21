// src/app/core/services/notification.service.ts
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { NOTIFICATION_ICONS, NOTIFICATION_POLL_INTERVAL } from '../constants/notification.constants';
import { NotificationResponse, NotificationDTO, NotificationActionRequest, NotificationStatus } from '../models/notification.interface';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly endpoint = 'api/notifications';
  private notificationsSubject = new BehaviorSubject<NotificationResponse[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);

  notifications$ = this.notificationsSubject.asObservable();
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private apiService: ApiService) {
    // Poll for notifications as fallback
    interval(NOTIFICATION_POLL_INTERVAL)
      .pipe(switchMap(() => this.loadNotifications()))
      .subscribe();
  }

  loadNotifications(): Observable<NotificationResponse[]> {
    return this.apiService.get<NotificationDTO[]>(this.endpoint)
      .pipe(
        map(notifications => notifications.map(n => this.formatNotification(n))),
        tap(notifications => {
          this.notificationsSubject.next(notifications);
          this.updateUnreadCount();
        })
      );
  }

  getArchivedNotifications(): Observable<NotificationResponse[]> {
    return this.apiService.get<NotificationDTO[]>(`${this.endpoint}/archived`)
      .pipe(map(notifications => notifications.map(n => this.formatNotification(n))));
  }

  performAction(request: NotificationActionRequest): Observable<void> {
    return this.apiService.post<void>(`${this.endpoint}/action`, request)
      .pipe(
        tap(() => {
          // Update local state based on action
          const current = this.notificationsSubject.value;
          let updated: NotificationResponse[];

          switch (request.action) {
            case 'MARK_READ':
              updated = current.map(n => 
                request.notificationIds.includes(n.notificationId)
                  ? { ...n, status: NotificationStatus.READ, readAt: new Date() }
                  : n
              );
              break;

            case 'MARK_UNREAD':
              updated = current.map(n => 
                request.notificationIds.includes(n.notificationId)
                  ? { ...n, status: NotificationStatus.UNREAD, readAt: undefined }
                  : n
              );
              break;

            case 'ARCHIVE':
              updated = current.map(n => 
                request.notificationIds.includes(n.notificationId)
                  ? { ...n, archived: true, archivedAt: new Date() }
                  : n
              );
              break;

            case 'UNARCHIVE':
              updated = current.map(n => 
                request.notificationIds.includes(n.notificationId)
                  ? { ...n, archived: false, archivedAt: undefined }
                  : n
              );
              break;

            case 'DELETE':
              updated = current.filter(n => !request.notificationIds.includes(n.notificationId));
              break;

            default:
              updated = current;
          }

          this.notificationsSubject.next(updated);
          this.updateUnreadCount();
        })
      );
  }

  markAllAsRead(): Observable<void> {
    return this.apiService.put<void>(`${this.endpoint}/read-all`, {})
      .pipe(
        tap(() => {
          const updated = this.notificationsSubject.value.map(n => ({
            ...n,
            status: NotificationStatus.READ,
            readAt: new Date()
          }));
          this.notificationsSubject.next(updated);
          this.updateUnreadCount();
        })
      );
  }

  archiveAll(): Observable<void> {
    return this.apiService.put<void>(`${this.endpoint}/archive-all`, {})
      .pipe(
        tap(() => {
          const updated = this.notificationsSubject.value.map(n => ({
            ...n,
            archived: true,
            archivedAt: new Date()
          }));
          this.notificationsSubject.next(updated);
          this.updateUnreadCount();
        })
      );
  }

  deleteAll(): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/delete-all`)
      .pipe(
        tap(() => {
          this.notificationsSubject.next([]);
          this.updateUnreadCount();
        })
      );
  }

  private formatNotification(notification: NotificationDTO): NotificationResponse {
    const iconConfig = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.SYSTEM;

    return {
      ...notification,
      icon: iconConfig.icon,
      iconClass: iconConfig.class,
      timeAgo: this.getTimeAgo(notification.createdAt)
    };
  }

  private updateUnreadCount(): void {
    const unreadCount = this.notificationsSubject.value
      .filter(n => !n.archived && n.status === NotificationStatus.UNREAD)
      .length;
    this.unreadCountSubject.next(unreadCount);
  }

  private getTimeAgo(date: Date): string {
    const minutes = Math.floor((new Date().getTime() - new Date(date).getTime()) / 60000);
    
    if (minutes < 60) {
      return `منذ ${minutes} دقيقة`;
    }
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `منذ ${hours} ساعة`;
    }
    
    const days = Math.floor(hours / 24);
    if (days < 30) {
      return `منذ ${days} يوم`;
    }
    
    const months = Math.floor(days / 30);
    return `منذ ${months} شهر`;
  }
}