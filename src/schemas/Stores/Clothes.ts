import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { Clothes } from '../../types/stores/clothes';

export interface ClothesDocument extends Document, Omit<Clothes, '_id'> {
    _id: Types.ObjectId;
}

export interface ClothesModel extends Model<ClothesDocument> {
    recalculateRating(clothesId: Types.ObjectId): Promise<void>;
}

const ClothesSchema = new Schema<ClothesDocument, ClothesModel>(
    {
        name: { type: String, required: true, trim: true },
        address: { type: String, required: true },
        phone: { type: String, required: true },
        category: { type: [String], required: true },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        isOpen: { type: Boolean, default: true },
        images: { type: [String], default: [] },
        description: { type: String, default: '' },
        brands: { type: [String], default: [] },
        returnPolicy: { type: String, default: '' },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes
ClothesSchema.index({ name: 'text', description: 'text' });
ClothesSchema.index({ category: 1 });
ClothesSchema.index({ rating: -1 });
ClothesSchema.index({ isOpen: 1 });
ClothesSchema.index({ brands: 1 });

// Static method to recalculate rating
ClothesSchema.statics.recalculateRating = async function (this: any, clothesId: Types.ObjectId) {
    const ClothesModel = this as ClothesModel;
    // Implementation for rating calculation if needed
    return;
};

export default mongoose.model<ClothesDocument, ClothesModel>('Clothes', ClothesSchema);
