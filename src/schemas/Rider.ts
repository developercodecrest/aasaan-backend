import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { Rider, RiderStatus, VehicleType } from '../types/rider';

export interface RiderDocument extends Document, Omit<Rider, '_id'> {
    _id: Types.ObjectId;
}

export interface RiderModel extends Model<RiderDocument> {
    findAvailableRiders(): Promise<RiderDocument[]>;
}

const LocationSchema = new Schema(
    {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        address: { type: String },
    },
    { _id: false }
);

const DocumentsSchema = new Schema(
    {
        drivingLicense: { type: String },
        vehicleRegistration: { type: String },
        aadharCard: { type: String },
        panCard: { type: String },
    },
    { _id: false }
);

const RiderSchema = new Schema<RiderDocument, RiderModel>(
    {
        name: { type: String, required: true, trim: true },
        phone: { type: String, required: true, unique: true },
        email: { type: String, unique: true, sparse: true },
        password: { type: String, required: true },
        vehicleType: { 
            type: String, 
            required: true,
            enum: Object.values(VehicleType)
        },
        vehicleNumber: { type: String, required: true },
        licenseNumber: { type: String, required: true },
        status: { 
            type: String, 
            required: true,
            enum: Object.values(RiderStatus),
            default: RiderStatus.OFFLINE,
            index: true
        },
        currentLocation: { type: LocationSchema },
        documents: { type: DocumentsSchema },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        totalDeliveries: { type: Number, default: 0, min: 0 },
        isActive: { type: Boolean, default: true, index: true },
        profileImage: { type: String },
    },
    {
        timestamps: true,
        toJSON: { 
            virtuals: true,
            transform: function(doc, ret: any) {
                delete ret.password;
                return ret;
            }
        },
        toObject: { 
            virtuals: true,
            transform: function(doc, ret: any) {
                delete ret.password;
                return ret;
            }
        },
    }
);

// Indexes
RiderSchema.index({ name: 'text', phone: 'text' });
RiderSchema.index({ status: 1, isActive: 1 });
RiderSchema.index({ vehicleType: 1 });
RiderSchema.index({ rating: -1 });

// Virtual populate for assigned orders
RiderSchema.virtual('assignedOrders', {
    ref: 'AssignedOrder',
    localField: '_id',
    foreignField: 'riderId'
});

// Static method to find available riders
RiderSchema.statics.findAvailableRiders = async function (this: any) {
    const RiderModel = this as RiderModel;
    return await RiderModel.find({
        status: RiderStatus.AVAILABLE,
        isActive: true
    }).select('-password');
};

export default mongoose.model<RiderDocument, RiderModel>('Rider', RiderSchema);
