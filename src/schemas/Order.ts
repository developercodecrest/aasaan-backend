import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { Order, StoreType, OrderStatus, PaymentMethod } from '../types/order';

export interface OrderDocument extends Document, Omit<Order, '_id'> {
    _id: Types.ObjectId;
}

export interface OrderModel extends Model<OrderDocument> {
    calculateOrderTotal(orderId: Types.ObjectId): Promise<number>;
}

const OrderItemSchema = new Schema(
    {
        itemId: { type: Schema.Types.ObjectId, required: true },
        itemType: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
        image: { type: String },
        description: { type: String },
    },
    { _id: false }
);

const DeliveryAddressSchema = new Schema(
    {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, required: true, default: 'India' },
        landmark: { type: String },
        contactPhone: { type: String, required: true },
    },
    { _id: false }
);

const TransactionDetailsSchema = new Schema(
    {
        transactionId: { type: String, required: true, unique: true },
        amount: { type: Number, required: true, min: 0 },
        paymentMethod: { 
            type: String, 
            required: true,
            enum: Object.values(PaymentMethod)
        },
        paymentStatus: { 
            type: String, 
            required: true,
            enum: ['success', 'pending', 'failed'],
            default: 'pending'
        },
        paidAt: { type: Date },
    },
    { _id: false }
);

const OrderSchema = new Schema<OrderDocument, OrderModel>(
    {
        userId: { 
            type: Schema.Types.ObjectId, 
            ref: 'User', 
            required: true,
            index: true 
        },
        storeType: { 
            type: String, 
            required: true,
            enum: Object.values(StoreType),
            index: true
        },
        storeId: { 
            type: Schema.Types.ObjectId, 
            required: true,
            index: true,
            refPath: 'storeType'
        },
        storeName: { type: String, required: true },
        items: { 
            type: [OrderItemSchema], 
            required: true,
            validate: {
                validator: function(items: any[]) {
                    return items && items.length > 0;
                },
                message: 'Order must have at least one item'
            }
        },
        status: { 
            type: String, 
            required: true,
            enum: Object.values(OrderStatus),
            default: OrderStatus.PENDING,
            index: true
        },
        deliveryAddress: { 
            type: DeliveryAddressSchema, 
            required: true 
        },
        totalAmount: { type: Number, required: true, min: 0 },
        subTotal: { type: Number, required: true, min: 0 },
        deliveryCharge: { type: Number, default: 0, min: 0 },
        tax: { type: Number, default: 0, min: 0 },
        discount: { type: Number, default: 0, min: 0 },
        transactionDetails: { type: TransactionDetailsSchema },
        notes: { type: String },
        estimatedDeliveryTime: { type: Date },
        deliveredAt: { type: Date },
        cancelledAt: { type: Date },
        cancellationReason: { type: String },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ storeId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ 'transactionDetails.transactionId': 1 });
OrderSchema.index({ createdAt: -1 });

// Virtual for user
OrderSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true,
});

// Static method to calculate order total
OrderSchema.statics.calculateOrderTotal = async function (this: any, orderId: Types.ObjectId) {
    const OrderModel = this as OrderModel;
    const order = await OrderModel.findById(orderId);
    
    if (!order) {
        throw new Error('Order not found');
    }
    
    const total = order.subTotal + order.deliveryCharge + order.tax - order.discount;
    order.totalAmount = total;
    await order.save();
    
    return total;
};

export default mongoose.model<OrderDocument, OrderModel>('Order', OrderSchema);
