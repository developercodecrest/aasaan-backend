import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { ClothesItem } from '../../types/stores/clothesItem';

export interface ClothesItemDocument extends Document, Omit<ClothesItem, '_id'> {
    _id: Types.ObjectId;
}

export interface ClothesItemModel extends Model<ClothesItemDocument> {}

const ClothesItemSchema = new Schema<ClothesItemDocument, ClothesItemModel>(
    {
        clothesId: { 
            type: Schema.Types.ObjectId, 
            ref: 'Clothes', 
            required: true,
            index: true 
        },
        name: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        category: { type: String, required: true },
        image: { type: String },
        isAvailable: { type: Boolean, default: true },
        brand: { type: String, required: true },
        size: { type: [String], required: true },
        color: { type: [String], required: true },
        material: { type: String, required: true },
        stock: { type: Number, default: 0, min: 0 },
        gender: { type: String, required: true },
        season: { type: String },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes
ClothesItemSchema.index({ name: 'text', description: 'text' });
ClothesItemSchema.index({ clothesId: 1, category: 1 });
ClothesItemSchema.index({ clothesId: 1, isAvailable: 1 });
ClothesItemSchema.index({ category: 1 });
ClothesItemSchema.index({ price: 1 });
ClothesItemSchema.index({ brand: 1 });
ClothesItemSchema.index({ gender: 1 });

// Virtual for clothes
ClothesItemSchema.virtual('clothes', {
    ref: 'Clothes',
    localField: 'clothesId',
    foreignField: '_id',
    justOne: true,
});

export default mongoose.model<ClothesItemDocument, ClothesItemModel>('ClothesItem', ClothesItemSchema);
