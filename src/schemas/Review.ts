import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { Review, ReviewType, ReviewableStoreType } from '../types/review';

export interface ReviewDocument extends Document, Omit<Review, '_id'> {
    _id: Types.ObjectId;
}

export interface ReviewModel extends Model<ReviewDocument> {}

const ReviewSchema = new Schema<ReviewDocument, ReviewModel>(
    {
        userId: { 
            type: Schema.Types.ObjectId, 
            ref: 'User', 
            required: true,
            index: true
        },
        reviewType: { 
            type: String, 
            required: true,
            enum: Object.values(ReviewType),
            index: true
        },
        
        // Store review fields
        storeType: { 
            type: String,
            enum: Object.values(ReviewableStoreType)
        },
        storeId: { 
            type: Schema.Types.ObjectId,
            refPath: 'storeType',
            index: true
        },
        
        // Rider review fields
        riderId: { 
            type: Schema.Types.ObjectId, 
            ref: 'Rider',
            index: true
        },
        
        // Order review fields
        orderId: { 
            type: Schema.Types.ObjectId, 
            ref: 'Order',
            index: true
        },
        
        rating: { 
            type: Number, 
            required: true, 
            min: 1, 
            max: 5,
            index: true
        },
        comment: { type: String },
        images: [{ type: String }],
        
        // Store owner reply
        reply: { type: String },
        repliedAt: { type: Date },
        repliedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        
        isVerifiedPurchase: { type: Boolean, default: false, index: true },
        isApproved: { type: Boolean, default: true, index: true },
        isFlagged: { type: Boolean, default: false, index: true },
        
        helpfulCount: { type: Number, default: 0 },
        unhelpfulCount: { type: Number, default: 0 },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Compound indexes
ReviewSchema.index({ storeId: 1, rating: -1 });
ReviewSchema.index({ storeId: 1, createdAt: -1 });
ReviewSchema.index({ riderId: 1, rating: -1 });
ReviewSchema.index({ riderId: 1, createdAt: -1 });
ReviewSchema.index({ userId: 1, createdAt: -1 });
ReviewSchema.index({ orderId: 1 });
ReviewSchema.index({ reviewType: 1, isApproved: 1 });

// Virtual populate for user
ReviewSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

// Virtual populate for store (dynamic based on storeType)
ReviewSchema.virtual('store', {
    refPath: 'storeType',
    localField: 'storeId',
    foreignField: '_id',
    justOne: true
});

// Virtual populate for rider
ReviewSchema.virtual('rider', {
    ref: 'Rider',
    localField: 'riderId',
    foreignField: '_id',
    justOne: true
});

// Virtual populate for order
ReviewSchema.virtual('order', {
    ref: 'Order',
    localField: 'orderId',
    foreignField: '_id',
    justOne: true
});

export default mongoose.model<ReviewDocument, ReviewModel>('Review', ReviewSchema);
