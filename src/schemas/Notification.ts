import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { Notification, NotificationType } from '../types/notification';

export interface NotificationDocument extends Document, Omit<Notification, '_id'> {
    _id: Types.ObjectId;
}

export interface NotificationModel extends Model<NotificationDocument> {}

const NotificationSchema = new Schema<NotificationDocument, NotificationModel>(
    {
        userId: { 
            type: Schema.Types.ObjectId, 
            ref: 'User', 
            required: true,
            index: true
        },
        type: { 
            type: String, 
            required: true,
            enum: Object.values(NotificationType),
            index: true
        },
        title: { 
            type: String, 
            required: true
        },
        message: { 
            type: String, 
            required: true
        },
        data: { 
            type: Schema.Types.Mixed
        },
        isRead: { 
            type: Boolean, 
            default: false,
            index: true
        },
        readAt: { 
            type: Date
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Compound indexes
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });

// Virtual populate for user
NotificationSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

export default mongoose.model<NotificationDocument, NotificationModel>('Notification', NotificationSchema);
