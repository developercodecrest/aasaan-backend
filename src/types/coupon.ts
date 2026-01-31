import { Types } from 'mongoose';

export enum CouponType {
    PERCENTAGE = 'percentage',
    FIXED = 'fixed',
    FREE_DELIVERY = 'free_delivery'
}

export enum CouponApplicableOn {
    ALL = 'all',
    RESTAURENT = 'Restaurent',
    MEDICAL = 'Medical',
    GROCERY = 'Grocery',
    CLOTHES = 'Clothes'
}

export interface Coupon {
    _id: Types.ObjectId;
    code: string;
    title: string;
    description?: string;
    type: CouponType;
    value: number; // Percentage or fixed amount
    maxDiscount?: number; // For percentage coupons
    minOrderAmount?: number;
    applicableOn: CouponApplicableOn;
    usageLimit?: number; // Total usage limit
    usagePerUser?: number; // Per user limit
    usedCount: number;
    validFrom: Date;
    validUntil: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CouponUsage {
    _id: Types.ObjectId;
    couponId: Types.ObjectId;
    userId: Types.ObjectId;
    orderId: Types.ObjectId;
    discountAmount: number;
    usedAt: Date;
}

export interface CreateCouponDTO {
    code: string;
    title: string;
    description?: string;
    type: CouponType;
    value: number;
    maxDiscount?: number;
    minOrderAmount?: number;
    applicableOn: CouponApplicableOn;
    usageLimit?: number;
    usagePerUser?: number;
    validFrom: Date;
    validUntil: Date;
}

export interface UpdateCouponDTO {
    title?: string;
    description?: string;
    value?: number;
    maxDiscount?: number;
    minOrderAmount?: number;
    usageLimit?: number;
    usagePerUser?: number;
    validFrom?: Date;
    validUntil?: Date;
    isActive?: boolean;
}

export interface ValidateCouponDTO {
    code: string;
    userId: string;
    orderAmount: number;
    storeType: string;
}

export interface ApplyCouponDTO {
    couponId: string;
    orderId: string;
}

export interface CouponFilterDTO {
    isActive?: boolean;
    applicableOn?: CouponApplicableOn;
    page?: number;
    limit?: number;
}
