import { Types } from 'mongoose';

export enum ReviewType {
    STORE = 'store',
    RIDER = 'rider',
    ORDER = 'order'
}

export enum ReviewableStoreType {
    RESTAURENT = 'Restaurent',
    MEDICAL = 'Medical',
    GROCERY = 'Grocery',
    CLOTHES = 'Clothes'
}

export interface Review {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    reviewType: ReviewType;
    
    // Store review fields
    storeType?: ReviewableStoreType;
    storeId?: Types.ObjectId;
    
    // Rider review fields
    riderId?: Types.ObjectId;
    
    // Order review fields
    orderId?: Types.ObjectId;
    
    rating: number; // 1-5
    comment?: string;
    images?: string[];
    
    // Store owner reply
    reply?: string;
    repliedAt?: Date;
    repliedBy?: Types.ObjectId;
    
    isVerifiedPurchase: boolean;
    isApproved: boolean;
    isFlagged: boolean;
    
    helpfulCount: number;
    unhelpfulCount: number;
    
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateReviewDTO {
    reviewType: ReviewType;
    storeType?: ReviewableStoreType;
    storeId?: string;
    riderId?: string;
    orderId?: string;
    rating: number;
    comment?: string;
    images?: string[];
}

export interface UpdateReviewDTO {
    rating?: number;
    comment?: string;
    images?: string[];
}

export interface ReplyToReviewDTO {
    reply: string;
}

export interface ReviewFilterDTO {
    reviewType?: ReviewType;
    storeType?: ReviewableStoreType;
    storeId?: string;
    riderId?: string;
    orderId?: string;
    userId?: string;
    rating?: number;
    minRating?: number;
    isVerifiedPurchase?: boolean;
    isApproved?: boolean;
    isFlagged?: boolean;
    page?: number;
    limit?: number;
}

export interface MarkReviewHelpfulDTO {
    helpful: boolean; // true for helpful, false for unhelpful
}

export interface FlagReviewDTO {
    reason: string;
}

export interface ReviewStats {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: {
        5: number;
        4: number;
        3: number;
        2: number;
        1: number;
    };
    verifiedPurchases: number;
    withComments: number;
    withImages: number;
}
