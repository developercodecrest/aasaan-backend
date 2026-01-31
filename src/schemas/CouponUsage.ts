import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { CouponUsage } from '../types/coupon';

export interface CouponUsageDocument extends Document, Omit<CouponUsage, '_id'> {
    _id: Types.ObjectId;
}

export interface CouponUsageModel extends Model<CouponUsageDocument> {}

const CouponUsageSchema = new Schema<CouponUsageDocument, CouponUsageModel>(
    {
        couponId: { 
            type: Schema.Types.ObjectId, 
            ref: 'Coupon', 
            required: true,
            index: true
        },
        userId: { 
            type: Schema.Types.ObjectId, 
            ref: 'User', 
            required: true,
            index: true
        },
        orderId: { 
            type: Schema.Types.ObjectId, 
            ref: 'Order', 
            required: true,
            index: true
        },
        discountAmount: { 
            type: Number, 
            required: true,
            min: 0
        },
        usedAt: { 
            type: Date, 
            default: Date.now
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Compound index
CouponUsageSchema.index({ couponId: 1, userId: 1 });

// Virtual populate for coupon
CouponUsageSchema.virtual('coupon', {
    ref: 'Coupon',
    localField: 'couponId',
    foreignField: '_id',
    justOne: true
});

// Virtual populate for user
CouponUsageSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

// Virtual populate for order
CouponUsageSchema.virtual('order', {
    ref: 'Order',
    localField: 'orderId',
    foreignField: '_id',
    justOne: true
});

export default mongoose.model<CouponUsageDocument, CouponUsageModel>('CouponUsage', CouponUsageSchema);
