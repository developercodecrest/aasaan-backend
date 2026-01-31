import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { Coupon, CouponType, CouponApplicableOn } from '../types/coupon';

export interface CouponDocument extends Document, Omit<Coupon, '_id'> {
    _id: Types.ObjectId;
}

export interface CouponModel extends Model<CouponDocument> {}

const CouponSchema = new Schema<CouponDocument, CouponModel>(
    {
        code: { 
            type: String, 
            required: true,
            unique: true,
            uppercase: true,
            trim: true
        },
        title: { 
            type: String, 
            required: true
        },
        description: { 
            type: String
        },
        type: { 
            type: String, 
            required: true,
            enum: Object.values(CouponType)
        },
        value: { 
            type: Number, 
            required: true,
            min: 0
        },
        maxDiscount: { 
            type: Number,
            min: 0
        },
        minOrderAmount: { 
            type: Number,
            min: 0
        },
        applicableOn: { 
            type: String, 
            required: true,
            enum: Object.values(CouponApplicableOn)
        },
        usageLimit: { 
            type: Number,
            min: 0
        },
        usagePerUser: { 
            type: Number,
            min: 0
        },
        usedCount: { 
            type: Number, 
            default: 0,
            min: 0
        },
        validFrom: { 
            type: Date, 
            required: true,
            index: true
        },
        validUntil: { 
            type: Date, 
            required: true,
            index: true
        },
        isActive: { 
            type: Boolean, 
            default: true,
            index: true
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes
CouponSchema.index({ code: 1 }, { unique: true });
CouponSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });

export default mongoose.model<CouponDocument, CouponModel>('Coupon', CouponSchema);
