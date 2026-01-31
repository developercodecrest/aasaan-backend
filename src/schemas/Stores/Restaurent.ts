import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import type {
  Restaurent as IRestaurent,
} from '../../types/stores/restaurent'

// Sub-document TypeScript interfaces to reflect schema shape beyond base IRestaurent
interface LocationDoc {
  type: 'Point'
  coordinates: [number, number]
}

interface ReviewDoc {
  _id?: Types.ObjectId
  restaurentId: Types.ObjectId
  userId: Types.ObjectId
  rating: number
  comment?: string
  createdAt?: Date
}

// MenuItemDoc removed - now in separate collection

interface OperatingHoursDoc {
  _id?: Types.ObjectId
  dayOfWeek: string
  openTime: string
  closeTime: string
}

interface ReservationDoc {
  _id?: Types.ObjectId
  userId: Types.ObjectId
  reservationTime: Date
  numberOfGuests: number
  specialRequests?: string
  createdAt?: Date
  updatedAt?: Date
}

interface EventDoc {
  _id?: Types.ObjectId
  title: string
  description?: string
  eventDate: Date
  createdAt?: Date
  updatedAt?: Date
}

interface PromotionDoc {
  _id?: Types.ObjectId
  title: string
  description?: string
  discountPercentage?: number
  startDate?: Date
  endDate?: Date
}

interface PhotoDoc {
  _id?: Types.ObjectId
  url: string
  description?: string
  uploadedAt?: Date
}

interface TagDoc {
  _id?: Types.ObjectId
  name: string
}

interface OwnerDoc {
  _id?: Types.ObjectId
  ownerId: Types.ObjectId
  role?: string
  createdAt?: Date
  updatedAt?: Date
}

interface CapacityDoc {
  totalSeats?: number
  availableSeats?: number
  lastUpdated?: Date
}

interface HealthInspectionDoc {
  _id?: Types.ObjectId
  inspectionDate: Date
  score: number
  violations?: string[]
  inspectorName?: string
  createdAt?: Date
  updatedAt?: Date
}

interface SocialMediaDoc {
  _id?: Types.ObjectId
  platform?: string
  url?: string
}

interface NotificationSettingDoc {
  emailNotifications?: boolean
  smsNotifications?: boolean
  pushNotifications?: boolean
  updatedAt?: Date
}

interface AccessibilityFeatureDoc {
  _id?: Types.ObjectId
  feature: string
  createdAt?: Date
  updatedAt?: Date
}

interface RestaurentDocument extends Document, IRestaurent {
  location?: LocationDoc
  reviews?: ReviewDoc[]
  operatingHours?: OperatingHoursDoc[]
  deliveryOption?: any
  reservations?: ReservationDoc[]
  events?: EventDoc[]
  promotions?: PromotionDoc[]
  photos?: PhotoDoc[]
  tags?: TagDoc[]
  owners?: OwnerDoc[]
  capacity?: CapacityDoc
  healthInspections?: HealthInspectionDoc[]
  socialMedias?: SocialMediaDoc[]
  notificationSettings?: NotificationSettingDoc
  accessibilityFeatures?: AccessibilityFeatureDoc[]

  addReview(review: Partial<ReviewDoc> & { userId: Types.ObjectId; rating: number }): Promise<RestaurentDocument>
}

interface RestaurentModel extends Model<RestaurentDocument> {
  recalculateRating(id: Types.ObjectId | string): Promise<number | null>
}

const { ObjectId } = Schema.Types

const LocationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere',
      required: true,
    },
  },
  { _id: false }
)

const ReviewSchema = new Schema(
  {
    restaurentId: { type: ObjectId, ref: 'Restaurent', required: true },
    userId: { type: ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 0, max: 5 },
    comment: { type: String, default: '' },
    createdAt: { type: Date, default: () => new Date() },
  },
  { _id: true }
)

// MenuItemSchema removed - now in separate collection (MenuItem.ts)

const OperatingHoursSchema = new Schema(
  {
    dayOfWeek: { type: String, required: true },
    openTime: { type: String, required: true },
    closeTime: { type: String, required: true },
  },
  { _id: true }
)

const DeliveryOptionSchema = new Schema(
  {
    isAvailable: { type: Boolean, default: false },
    deliveryFee: { type: Number, default: 0 },
    estimatedDeliveryTime: { type: String, default: '' },
  },
  { _id: false }
)

const ReservationSchema = new Schema(
  {
    userId: { type: ObjectId, ref: 'User', required: true },
    reservationTime: { type: Date, required: true },
    numberOfGuests: { type: Number, required: true, min: 1 },
    specialRequests: { type: String },
  },
  { timestamps: true }
)

const EventSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    eventDate: { type: Date, required: true },
  },
  { timestamps: true }
)

const PromotionSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    discountPercentage: { type: Number, min: 0, max: 100 },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true }
)

const PhotoSchema = new Schema(
  {
    url: { type: String, required: true },
    description: { type: String },
    uploadedAt: { type: Date, default: () => new Date() },
  },
  { _id: true }
)

const TagSchema = new Schema(
  {
    name: { type: String, required: true, unique: false },
  },
  { _id: true }
)

const OwnerSchema = new Schema(
  {
    ownerId: { type: ObjectId, ref: 'User', required: true },
    role: { type: String, default: 'manager' },
  },
  { timestamps: true }
)

const CapacitySchema = new Schema(
  {
    totalSeats: { type: Number, default: 0 },
    availableSeats: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: () => new Date() },
  },
  { _id: false }
)

const HealthInspectionSchema = new Schema(
  {
    inspectionDate: { type: Date, required: true },
    score: { type: Number, required: true },
    violations: { type: [String], default: [] },
    inspectorName: { type: String },
  },
  { timestamps: true }
)

const SocialMediaSchema = new Schema(
  {
    platform: { type: String },
    url: { type: String },
  },
  { _id: true }
)

const NotificationSettingSchema = new Schema(
  {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    pushNotifications: { type: Boolean, default: false },
    updatedAt: { type: Date, default: () => new Date() },
  },
  { _id: false }
)

const AccessibilityFeatureSchema = new Schema(
  {
    feature: { type: String, required: true },
  },
  { timestamps: true }
)

const RestaurentSchema = new Schema<RestaurentDocument>(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    cuisine: { type: [String], default: [] },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    isOpen: { type: Boolean, default: true },
    images: { type: [String], default: [] },
    description: { type: String, default: '' },
    location: { type: LocationSchema, required: false },

    // Embedded / related data
    reviews: { type: [ReviewSchema], default: [] },
    operatingHours: { type: [OperatingHoursSchema], default: [] },
    deliveryOption: { type: DeliveryOptionSchema, default: {} },
    reservations: { type: [ReservationSchema], default: [] },
    events: { type: [EventSchema], default: [] },
    promotions: { type: [PromotionSchema], default: [] },
    photos: { type: [PhotoSchema], default: [] },
    tags: { type: [TagSchema], default: [] },
    owners: { type: [OwnerSchema], default: [] },
    capacity: { type: CapacitySchema, default: {} },
    healthInspections: { type: [HealthInspectionSchema], default: [] },
    socialMedias: { type: [SocialMediaSchema], default: [] },
    notificationSettings: { type: NotificationSettingSchema, default: {} },
    accessibilityFeatures: { type: [AccessibilityFeatureSchema], default: [] },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Text index for quick searching
RestaurentSchema.index({ name: 'text', description: 'text', cuisine: 'text', address: 'text' })

// Virtual: summary for listings
RestaurentSchema.virtual('summary').get(function (this: RestaurentDocument) {
  return {
    _id: this._id,
    name: this.name,
    cuisine: this.cuisine,
    rating: this.rating,
    isOpen: this.isOpen,
    images: this.images,
  }
});

// Static: recalculate rating from reviews (useful after adding/removing reviews)
(RestaurentSchema.statics as any).recalculateRating = async function (this: any, id: Types.ObjectId | string) {
  const self = this as RestaurentModel
  const doc = await self.findById(id).select('reviews')
  if (!doc) return null
  const reviews = (doc as unknown as { reviews: { rating: number }[] }).reviews || []
  if (!reviews.length) {
    await this.findByIdAndUpdate(id, { rating: 0 })
    return 0
  }
  const avg = reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length
  const rounded = Math.round(avg * 10) / 10
  await this.findByIdAndUpdate(id, { rating: rounded })
  return rounded
};

// Instance helper: add review
(RestaurentSchema.methods as any).addReview = async function (this: any, review: any) {
  const self = this as RestaurentDocument
  if (!self.reviews) self.reviews = []
  self.reviews.push(review as ReviewDoc)
  await self.save()
  // recalc rating
  await ((self.constructor as unknown) as RestaurentModel).recalculateRating(self._id)
  return self
}

const RestaurentModel = (mongoose.models.Restaurent as RestaurentModel) || mongoose.model<RestaurentDocument, RestaurentModel>('Restaurent', RestaurentSchema)

export default RestaurentModel
