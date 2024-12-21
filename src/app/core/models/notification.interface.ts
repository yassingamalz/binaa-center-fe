// src/app/core/models/enums/notification-type.enum.ts
export enum NotificationType {
    SESSION = 'SESSION',
    PAYMENT = 'PAYMENT',
    ASSESSMENT = 'ASSESSMENT',
    CASE = 'CASE',
    SYSTEM = 'SYSTEM'
}

// src/app/core/models/enums/notification-status.enum.ts
export enum NotificationStatus {
    UNREAD = 'UNREAD',
    READ = 'READ'
}

// src/app/core/models/interfaces/notification.interface.ts
export interface NotificationDTO {
    notificationId: number;
    userId: number;
    type: NotificationType;
    title: string;
    message: string;
    status: NotificationStatus;
    data?: Record<string, any>;
    createdAt: Date;
    readAt?: Date;
    archived: boolean;
    archivedAt?: Date;
}

export interface NotificationResponse extends NotificationDTO {
    icon: string;        // Font Awesome icon class
    iconClass: string;   // CSS class for icon
    timeAgo: string;     // Formatted time ago in Arabic
}

export interface NotificationActionRequest {
    notificationIds: number[];
    action: NotificationAction;
}

export enum NotificationAction {
    MARK_READ = 'MARK_READ',
    MARK_UNREAD = 'MARK_UNREAD',
    ARCHIVE = 'ARCHIVE',
    UNARCHIVE = 'UNARCHIVE',
    DELETE = 'DELETE'
}