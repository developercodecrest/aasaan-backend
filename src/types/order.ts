import { Types } from "mongoose";

export enum StoreType {
    RESTAURENT = "Restaurent",
    MEDICAL = "Medical",
    GROCERY = "Grocery",
    CLOTHES = "Clothes"
}

export enum OrderStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    PREPARING = "preparing",
    OUT_FOR_DELIVERY = "out-for-delivery",
    DELIVERED = "delivered",
    CANCELLED = "cancelled"
}

export enum PaymentMethod {
    COD = "cod",
    ONLINE = "online",
    CARD = "card",
    UPI = "upi",
    WALLET = "wallet"
}

export interface OrderItem {
    itemId: Types.ObjectId;
    itemType: string; // MenuItem, MedicalItem, GroceryItem, ClothesItem
    name: string;
    price: number;
    quantity: number;
    image?: string;
    description?: string;
}

export interface DeliveryAddress {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    landmark?: string;
    contactPhone: string;
}

export interface TransactionDetails {
    transactionId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    paymentStatus: string; // success, pending, failed
    paidAt?: Date;
}

export interface Order {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    storeType: StoreType;
    storeId: Types.ObjectId;
    storeName: string;
    items: OrderItem[];
    status: OrderStatus;
    deliveryAddress: DeliveryAddress;
    totalAmount: number;
    subTotal: number;
    deliveryCharge: number;
    tax: number;
    discount: number;
    transactionDetails?: TransactionDetails;
    notes?: string;
    estimatedDeliveryTime?: Date;
    deliveredAt?: Date;
    cancelledAt?: Date;
    cancellationReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateOrderDTO {
    userId: Types.ObjectId;
    storeType: StoreType;
    storeId: Types.ObjectId;
    storeName: string;
    items: OrderItem[];
    deliveryAddress: DeliveryAddress;
    subTotal: number;
    deliveryCharge?: number;
    tax?: number;
    discount?: number;
    notes?: string;
    estimatedDeliveryTime?: Date;
}

export interface UpdateOrderDTO {
    status?: OrderStatus;
    deliveryAddress?: DeliveryAddress;
    estimatedDeliveryTime?: Date;
    notes?: string;
}

export interface UpdateOrderTransactionDTO {
    transactionId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    paymentStatus: string;
    paidAt?: Date;
}

export interface OrderFilterDTO {
    userId?: Types.ObjectId;
    storeType?: StoreType;
    storeId?: Types.ObjectId;
    status?: OrderStatus;
    minAmount?: number;
    maxAmount?: number;
    startDate?: Date;
    endDate?: Date;
}

export interface OrderQueryOptions {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedOrderResult {
    orders: Order[];
    total: number;
    page: number;
    limit: number;
}
