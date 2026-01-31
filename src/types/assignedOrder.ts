import { Types } from 'mongoose';

export enum AssignedOrderStatus {
    ASSIGNED = 'assigned',
    PICKED_UP = 'picked-up',
    IN_TRANSIT = 'in-transit',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled'
}

export interface AssignedOrder {
    _id: Types.ObjectId;
    riderId: Types.ObjectId;
    orderId: Types.ObjectId;
    userId: Types.ObjectId;
    status: AssignedOrderStatus;
    assignedAt: Date;
    pickedUpAt?: Date;
    deliveredAt?: Date;
    cancelledAt?: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateAssignedOrderDTO {
    riderId: string;
    orderId: string;
    userId: string;
    notes?: string;
}

export interface UpdateAssignedOrderDTO {
    status?: AssignedOrderStatus;
    notes?: string;
}

export interface UpdateAssignedOrderStatusDTO {
    status: AssignedOrderStatus;
}

export interface AssignedOrderFilterDTO {
    riderId?: string;
    orderId?: string;
    userId?: string;
    status?: AssignedOrderStatus;
    fromDate?: Date;
    toDate?: Date;
    page?: number;
    limit?: number;
}

export interface BulkAssignOrdersDTO {
    riderId: string;
    orders: Array<{
        orderId: string;
        userId: string;
        notes?: string;
    }>;
}
