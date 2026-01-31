import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { SupportTicket, TicketStatus, TicketPriority, TicketCategory, TicketMessage } from '../types/support';
import Counter from './Counter';

export interface SupportTicketDocument extends Document, Omit<SupportTicket, '_id'> {
    _id: Types.ObjectId;
}

export interface SupportTicketModel extends Model<SupportTicketDocument> {}

const TicketMessageSchema = new Schema<TicketMessage>(
    {
        userId: { 
            type: Schema.Types.ObjectId, 
            ref: 'User', 
            required: true
        },
        message: { 
            type: String, 
            required: true
        },
        attachments: [{ 
            type: String
        }],
        isStaff: { 
            type: Boolean, 
            default: false
        },
        createdAt: { 
            type: Date, 
            default: Date.now
        }
    },
    { _id: false }
);

const SupportTicketSchema = new Schema<SupportTicketDocument, SupportTicketModel>(
    {
        ticketNumber: { 
            type: String, 
            unique: true
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
            index: true
        },
        category: { 
            type: String, 
            required: true,
            enum: Object.values(TicketCategory),
            index: true
        },
        priority: { 
            type: String, 
            default: TicketPriority.MEDIUM,
            enum: Object.values(TicketPriority),
            index: true
        },
        status: { 
            type: String, 
            default: TicketStatus.OPEN,
            enum: Object.values(TicketStatus),
            index: true
        },
        subject: { 
            type: String, 
            required: true
        },
        description: { 
            type: String, 
            required: true
        },
        messages: [TicketMessageSchema],
        assignedTo: { 
            type: Schema.Types.ObjectId, 
            ref: 'User',
            index: true
        },
        resolvedAt: { 
            type: Date
        },
        closedAt: { 
            type: Date
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes
SupportTicketSchema.index({ ticketNumber: 1 }, { unique: true });
SupportTicketSchema.index({ userId: 1, status: 1 });
SupportTicketSchema.index({ status: 1, priority: 1 });

// Pre-save hook to generate ticketNumber using Counter pattern
SupportTicketSchema.pre('save', async function() {
    if (!this.isNew) {
        return;
    }

    const counter = await Counter.findOneAndUpdate(
        { id: 'ticketNumber' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );

    const paddedNumber = counter.seq.toString().padStart(6, '0');
    this.ticketNumber = `TKT-${paddedNumber}`;
});

// Virtual populate for user
SupportTicketSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

// Virtual populate for order
SupportTicketSchema.virtual('order', {
    ref: 'Order',
    localField: 'orderId',
    foreignField: '_id',
    justOne: true
});

// Virtual populate for assignedTo
SupportTicketSchema.virtual('assignedToUser', {
    ref: 'User',
    localField: 'assignedTo',
    foreignField: '_id',
    justOne: true
});

export default mongoose.model<SupportTicketDocument, SupportTicketModel>('SupportTicket', SupportTicketSchema);
