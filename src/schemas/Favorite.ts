import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { Favorite, FavoriteType, FavoriteStoreType, FavoriteItemType } from '../types/favorite';

export interface FavoriteDocument extends Document, Omit<Favorite, '_id'> {
    _id: Types.ObjectId;
}

export interface FavoriteModel extends Model<FavoriteDocument> {}

const FavoriteSchema = new Schema<FavoriteDocument, FavoriteModel>(
    {
        userId: { 
            type: Schema.Types.ObjectId, 
            ref: 'User', 
            required: true,
            index: true
        },
        favoriteType: { 
            type: String, 
            required: true,
            enum: Object.values(FavoriteType),
            index: true
        },
        
        // Store favorite fields
        storeType: { 
            type: String,
            enum: Object.values(FavoriteStoreType)
        },
        storeId: { 
            type: Schema.Types.ObjectId,
            refPath: 'storeType',
            index: true
        },
        
        // Item favorite fields
        itemType: { 
            type: String,
            enum: Object.values(FavoriteItemType)
        },
        itemId: { 
            type: Schema.Types.ObjectId,
            refPath: 'itemType',
            index: true
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Unique compound indexes
FavoriteSchema.index({ userId: 1, storeId: 1 }, { 
    unique: true, 
    partialFilterExpression: { storeId: { $exists: true } } 
});
FavoriteSchema.index({ userId: 1, itemId: 1 }, { 
    unique: true, 
    partialFilterExpression: { itemId: { $exists: true } } 
});

// Validate that appropriate fields are set based on favoriteType
FavoriteSchema.pre('validate', function() {
    if (this.favoriteType === FavoriteType.STORE && (!this.storeType || !this.storeId)) {
        throw new Error('storeType and storeId are required for store favorites');
    } else if (this.favoriteType === FavoriteType.ITEM && (!this.itemType || !this.itemId)) {
        throw new Error('itemType and itemId are required for item favorites');
    }
});

// Virtual populate for store (dynamic based on storeType)
FavoriteSchema.virtual('store', {
    refPath: 'storeType',
    localField: 'storeId',
    foreignField: '_id',
    justOne: true
});

// Virtual populate for item (dynamic based on itemType)
FavoriteSchema.virtual('item', {
    refPath: 'itemType',
    localField: 'itemId',
    foreignField: '_id',
    justOne: true
});

// Virtual populate for user
FavoriteSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

export default mongoose.model<FavoriteDocument, FavoriteModel>('Favorite', FavoriteSchema);
