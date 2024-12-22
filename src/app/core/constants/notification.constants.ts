// src/app/core/constants/notification.constants.ts
import { NotificationType } from '../models/notification.interface';
import { NotificationIconMap } from '../models/types/notification.types';

export const NOTIFICATION_ICONS: NotificationIconMap = {
    [NotificationType.SESSION]: { 
        icon: 'fas fa-calendar-check', 
        class: 'text-primary' 
    },
    [NotificationType.PAYMENT]: { 
        icon: 'fas fa-coins', 
        class: 'text-success' 
    },
    [NotificationType.ASSESSMENT]: { 
        icon: 'fas fa-clipboard-list', 
        class: 'text-info' 
    },
    [NotificationType.CASE]: { 
        icon: 'fas fa-user', 
        class: 'text-warning' 
    },
    [NotificationType.SYSTEM]: { 
        icon: 'fas fa-bell', 
        class: 'text-secondary' 
    }
};

export const NOTIFICATION_POLL_INTERVAL = 6000; // 1 minute in milliseconds