import { Types } from 'mongoose';

export enum NotificationType {
    ORDER_PLACED = 'order_placed',
    ORDER_CONFIRMED = 'order_confirmed',
    ORDER_PREPARING = 'order_preparing',
    ORDER_OUT_FOR_DELIVERY = 'order_out_for_delivery',
    ORDER_DELIVERED = 'order_delivered',
    ORDER_CANCELLED = 'order_cancelled',
    
    RIDER_ASSIGNED = 'rider_assigned',
    RIDER_ARRIVED = 'rider_arrived',
    
    REVIEW_RECEIVED = 'review_received',
    REVIEW_REPLY = 'review_reply',
    
    COUPON_AVAILABLE = 'coupon_available',
    COUPON_EXPIRING = 'coupon_expiring',
    
    SUPPORT_TICKET_RESPONSE = 'support_ticket_response',
    SUPPORT_TICKET_RESOLVED = 'support_ticket_resolved',
    
    SYSTEM_ANNOUNCEMENT = 'system_announcement'
}

export interface Notification {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    type: NotificationType;
    title: string;
    message: string;
    data?: any; // Additional data (orderId, riderId, etc.)
    isRead: boolean;
    readAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateNotificationDTO {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
}

export interface NotificationFilterDTO {
    userId?: string;
    type?: NotificationType;
    isRead?: boolean;
    fromDate?: Date;
    toDate?: Date;
    page?: number;
    limit?: number;
}

export interface MarkNotificationsReadDTO {
    notificationIds: string[];
}

export interface NotificationPreferences {
    orderUpdates: boolean;
    riderUpdates: boolean;
    reviews: boolean;
    promotions: boolean;
    systemAnnouncements: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
}
