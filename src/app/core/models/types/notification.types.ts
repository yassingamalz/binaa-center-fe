// src/app/core/models/types/notification.types.ts
import { NotificationType } from "../notification.interface";

export type NotificationIconMap = {
    [key in NotificationType]: {
        icon: string;
        class: string;
    }
}

export type NotificationData = {
    sessionId?: number;
    caseId?: number;
    paymentId?: number;
    assessmentId?: number;
    [key: string]: any;
}