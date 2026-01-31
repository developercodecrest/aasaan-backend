import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { Grocery } from '../../types/stores/grocery';

export interface GroceryDocument extends Document, Omit<Grocery, '_id'> {
    _id: Types.ObjectId;
}

export interface GroceryModel extends Model<GroceryDocument> {
    recalculateRating(groceryId: Types.ObjectId): Promise<void>;
}

const GrocerySchema = new Schema<GroceryDocument, GroceryModel>(
    {
        name: { type: String, required: true, trim: true },
        address: { type: String, required: true },
        phone: { type: String, required: true },
        category: { type: [String], required: true },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        isOpen: { type: Boolean, default: true },
        images: { type: [String], default: [] },
        description: { type: String, default: '' },
        deliveryAvailable: { type: Boolean, default: false },
        minimumOrder: { type: Number, default: 0, min: 0 },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes
GrocerySchema.index({ name: 'text', description: 'text' });
GrocerySchema.index({ category: 1 });
GrocerySchema.index({ rating: -1 });
GrocerySchema.index({ isOpen: 1 });
GrocerySchema.index({ deliveryAvailable: 1 });

// Static method to recalculate rating
GrocerySchema.statics.recalculateRating = async function (this: any, groceryId: Types.ObjectId) {
    const GroceryModel = this as GroceryModel;
    // Implementation for rating calculation if needed
    return;
};

export default mongoose.model<GroceryDocument, GroceryModel>('Grocery', GrocerySchema);
