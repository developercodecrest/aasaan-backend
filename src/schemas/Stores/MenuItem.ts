import mongoose, { Schema, Document } from 'mongoose';
import type { MenuItem as IMenuItem } from '../../types/stores/menuItem';

interface MenuItemDocument extends Document, IMenuItem {}

const { ObjectId } = Schema.Types;

const NutritionalInfoSchema = new Schema(
  {
    calories: { type: Number },
    protein: { type: Number },
    carbs: { type: Number },
    fat: { type: Number },
  },
  { _id: false }
);

const MenuItemSchema = new Schema<MenuItemDocument>(
  {
    restaurentId: {
      type: ObjectId,
      ref: 'Restaurent',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      default: 'general',
      index: true,
    },
    image: {
      type: String,
      default: '',
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    preparationTime: {
      type: Number,
      default: 0,
    },
    ingredients: {
      type: [String],
      default: [],
    },
    allergens: {
      type: [String],
      default: [],
    },
    nutritionalInfo: {
      type: NutritionalInfoSchema,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient querying
MenuItemSchema.index({ restaurentId: 1, category: 1 });
MenuItemSchema.index({ restaurentId: 1, isAvailable: 1 });
MenuItemSchema.index({ name: 'text', description: 'text' });

// Virtual populate for restaurant details
MenuItemSchema.virtual('restaurent', {
  ref: 'Restaurent',
  localField: 'restaurentId',
  foreignField: '_id',
  justOne: true,
});

const MenuItemModel = mongoose.models.MenuItem || mongoose.model<MenuItemDocument>('MenuItem', MenuItemSchema);

export default MenuItemModel;
