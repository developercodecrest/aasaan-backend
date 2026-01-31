import { Types } from 'mongoose';

export enum TicketStatus {
    OPEN = 'open',
    IN_PROGRESS = 'in_progress',
    RESOLVED = 'resolved',
    CLOSED = 'closed'
}

export enum TicketPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    URGENT = 'urgent'
}

export enum TicketCategory {
    ORDER_ISSUE = 'order_issue',
    PAYMENT_ISSUE = 'payment_issue',
    DELIVERY_ISSUE = 'delivery_issue',
    PRODUCT_QUALITY = 'product_quality',
    RIDER_BEHAVIOR = 'rider_behavior',
    TECHNICAL_ISSUE = 'technical_issue',
    ACCOUNT_ISSUE = 'account_issue',
    OTHER = 'other'
}

export interface TicketMessage {
    userId: Types.ObjectId;
    message: string;
    attachments?: string[];
    isStaff: boolean;
    createdAt: Date;
}

export interface SupportTicket {
    _id: Types.ObjectId;
    ticketNumber: string;
    userId: Types.ObjectId;
    orderId?: Types.ObjectId;
    category: TicketCategory;
    priority: TicketPriority;
    status: TicketStatus;
    subject: string;
    description: string;
    messages: TicketMessage[];
    assignedTo?: Types.ObjectId;
    resolvedAt?: Date;
    closedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateTicketDTO {
    orderId?: string;
    category: TicketCategory;
    subject: string;
    description: string;
    attachments?: string[];
}

export interface UpdateTicketDTO {
    status?: TicketStatus;
    priority?: TicketPriority;
    assignedTo?: string;
}

export interface AddTicketMessageDTO {
    message: string;
    attachments?: string[];
}

export interface TicketFilterDTO {
    userId?: string;
    status?: TicketStatus;
    priority?: TicketPriority;
    category?: TicketCategory;
    assignedTo?: string;
    page?: number;
    limit?: number;
}
