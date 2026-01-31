import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { Medical } from '../../types/stores/medical';

export interface MedicalDocument extends Document, Omit<Medical, '_id'> {
    _id: Types.ObjectId;
}

export interface MedicalModel extends Model<MedicalDocument> {
    recalculateRating(medicalId: Types.ObjectId): Promise<void>;
}

const MedicalSchema = new Schema<MedicalDocument, MedicalModel>(
    {
        name: { type: String, required: true, trim: true },
        address: { type: String, required: true },
        phone: { type: String, required: true },
        category: { type: [String], required: true },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        isOpen: { type: Boolean, default: true },
        images: { type: [String], default: [] },
        description: { type: String, default: '' },
        licenseNumber: { type: String, required: true, unique: true },
        emergencyServices: { type: Boolean, default: false },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes
MedicalSchema.index({ name: 'text', description: 'text' });
MedicalSchema.index({ category: 1 });
MedicalSchema.index({ rating: -1 });
MedicalSchema.index({ isOpen: 1 });
MedicalSchema.index({ licenseNumber: 1 });

// Static method to recalculate rating
MedicalSchema.statics.recalculateRating = async function (this: any, medicalId: Types.ObjectId) {
    const MedicalModel = this as MedicalModel;
    // Implementation for rating calculation if needed
    return;
};

export default mongoose.model<MedicalDocument, MedicalModel>('Medical', MedicalSchema);
