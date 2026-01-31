import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { MedicalItem } from '../../types/stores/medicalItem';

export interface MedicalItemDocument extends Document, Omit<MedicalItem, '_id'> {
    _id: Types.ObjectId;
}

export interface MedicalItemModel extends Model<MedicalItemDocument> {}

const MedicalItemSchema = new Schema<MedicalItemDocument, MedicalItemModel>(
    {
        medicalId: { 
            type: Schema.Types.ObjectId, 
            ref: 'Medical', 
            required: true,
            index: true 
        },
        name: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        category: { type: String, required: true },
        image: { type: String },
        isAvailable: { type: Boolean, default: true },
        manufacturer: { type: String },
        expiryDate: { type: Date },
        prescriptionRequired: { type: Boolean, default: false },
        stock: { type: Number, default: 0, min: 0 },
        dosageForm: { type: String },
        strength: { type: String },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes
MedicalItemSchema.index({ name: 'text', description: 'text' });
MedicalItemSchema.index({ medicalId: 1, category: 1 });
MedicalItemSchema.index({ medicalId: 1, isAvailable: 1 });
MedicalItemSchema.index({ category: 1 });
MedicalItemSchema.index({ price: 1 });
MedicalItemSchema.index({ prescriptionRequired: 1 });

// Virtual for medical
MedicalItemSchema.virtual('medical', {
    ref: 'Medical',
    localField: 'medicalId',
    foreignField: '_id',
    justOne: true,
});

export default mongoose.model<MedicalItemDocument, MedicalItemModel>('MedicalItem', MedicalItemSchema);
