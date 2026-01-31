import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { AssignedOrder, AssignedOrderStatus } from '../types/assignedOrder';

export interface AssignedOrderDocument extends Document, Omit<AssignedOrder, '_id'> {
    _id: Types.ObjectId;
}

export interface AssignedOrderModel extends Model<AssignedOrderDocument> {}

const AssignedOrderSchema = new Schema<AssignedOrderDocument, AssignedOrderModel>(
    {
        riderId: { 
            type: Schema.Types.ObjectId, 
            ref: 'Rider', 
            required: true,
            index: true
        },
        orderId: { 
            type: Schema.Types.ObjectId, 
            ref: 'Order', 
            required: true,
            index: true
        },
        userId: { 
            type: Schema.Types.ObjectId, 
            ref: 'User', 
            required: true,
            index: true
        },
        status: { 
            type: String, 
            required: true,
            enum: Object.values(AssignedOrderStatus),
            default: AssignedOrderStatus.ASSIGNED,
            index: true
        },
        assignedAt: { type: Date, default: Date.now, index: true },
        pickedUpAt: { type: Date },
        deliveredAt: { type: Date },
        cancelledAt: { type: Date },
        notes: { type: String },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Compound indexes for efficient queries
AssignedOrderSchema.index({ riderId: 1, status: 1 });
AssignedOrderSchema.index({ riderId: 1, assignedAt: -1 });
AssignedOrderSchema.index({ orderId: 1, riderId: 1 }, { unique: true }); // Prevent duplicate assignments
AssignedOrderSchema.index({ userId: 1, status: 1 });
AssignedOrderSchema.index({ status: 1, assignedAt: -1 });

// Virtual populate for rider details
AssignedOrderSchema.virtual('rider', {
    ref: 'Rider',
    localField: 'riderId',
    foreignField: '_id',
    justOne: true
});

// Virtual populate for order details
AssignedOrderSchema.virtual('order', {
    ref: 'Order',
    localField: 'orderId',
    foreignField: '_id',
    justOne: true
});

// Virtual populate for user details
AssignedOrderSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

export default mongoose.model<AssignedOrderDocument, AssignedOrderModel>('AssignedOrder', AssignedOrderSchema);
