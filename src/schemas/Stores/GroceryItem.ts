import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { GroceryItem } from '../../types/stores/groceryItem';

export interface GroceryItemDocument extends Document, Omit<GroceryItem, '_id'> {
    _id: Types.ObjectId;
}

export interface GroceryItemModel extends Model<GroceryItemDocument> {}

const GroceryItemSchema = new Schema<GroceryItemDocument, GroceryItemModel>(
    {
        groceryId: { 
            type: Schema.Types.ObjectId, 
            ref: 'Grocery', 
            required: true,
            index: true 
        },
        name: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        category: { type: String, required: true },
        image: { type: String },
        isAvailable: { type: Boolean, default: true },
        brand: { type: String },
        unit: { type: String, required: true },
        quantity: { type: Number, required: true, min: 0 },
        stock: { type: Number, default: 0, min: 0 },
        organic: { type: Boolean, default: false },
        expiryDate: { type: Date },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes
GroceryItemSchema.index({ name: 'text', description: 'text' });
GroceryItemSchema.index({ groceryId: 1, category: 1 });
GroceryItemSchema.index({ groceryId: 1, isAvailable: 1 });
GroceryItemSchema.index({ category: 1 });
GroceryItemSchema.index({ price: 1 });
GroceryItemSchema.index({ organic: 1 });

// Virtual for grocery
GroceryItemSchema.virtual('grocery', {
    ref: 'Grocery',
    localField: 'groceryId',
    foreignField: '_id',
    justOne: true,
});

export default mongoose.model<GroceryItemDocument, GroceryItemModel>('GroceryItem', GroceryItemSchema);
