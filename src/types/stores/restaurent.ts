import { Types } from "mongoose";

export interface Restaurent {
    _id: Types.ObjectId
    name: string;
    address: string;
    phone: string;
    cuisine: string[];
    rating: number;
    isOpen: boolean;
    images: string[];
    description: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateRestaurentDTO {
    name: string;
    address: string;
    phone: string;
    cuisine: string[];
    images?: string[];
    description?: string;
}

export interface UpdateRestaurentDTO {
    name?: string;
    address?: string;
    phone?: string;
    cuisine?: string[];
    isOpen?: boolean;
    images?: string[];
    description?: string;
}

export interface RestaurentFilterDTO {
    name?: string;
    cuisine?: string[];
    minRating?: number;
    isOpen?: boolean;
}

export interface RestaurentRatingDTO {
    rating: number;
}

export interface RestaurentQueryOptions {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedRestaurentResult {
    restaurents: Restaurent[];
    total: number;
    page: number;
    limit: number;
}

export interface RestaurentSummary {
    _id: Types.ObjectId;
    name: string;
    cuisine: string[];
    rating: number;
    isOpen: boolean;
    images: string[];
}

export interface RestaurentStatistics {
    totalRestaurents: number;
    averageRating: number;
    openRestaurents: number;
    cuisinesCount: { [cuisine: string]: number };
}

export interface RestaurentReview {
    _id: Types.ObjectId;
    restaurentId: Types.ObjectId;
    userId: Types.ObjectId;
    rating: number;
    comment: string;
    createdAt: Date;
}

export interface CreateRestaurentReviewDTO {
    restaurentId: Types.ObjectId;
    userId: Types.ObjectId;
    rating: number;
    comment: string;
}

export interface UpdateRestaurentReviewDTO {
    rating?: number;
    comment?: string;
}

export interface RestaurentReviewFilterDTO {
    restaurentId?: Types.ObjectId;
    userId?: Types.ObjectId;
    minRating?: number;
}

export interface PaginatedRestaurentReviewResult {
    reviews: RestaurentReview[];
    total: number;
    page: number;
    limit: number;
}

export interface RestaurentWithReviews extends Restaurent {
    reviews: RestaurentReview[];
}

export interface RestaurentLocation {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
}

export interface RestaurentWithLocation extends Restaurent {
    location: RestaurentLocation;
}

export interface NearbyRestaurentDTO {
    latitude: number;
    longitude: number;
    radius: number; // in meters
}

export interface PaginatedNearbyRestaurentResult {
    restaurents: RestaurentWithLocation[];
    total: number;
    page: number;
    limit: number;
}

export interface RestaurentMenuItem {
    _id: Types.ObjectId;
    restaurentId: Types.ObjectId;
    name: string;
    description: string;
    price: number;
    category: string;
    image?: string;
}

export interface CreateRestaurentMenuItemDTO {
    restaurentId: Types.ObjectId;
    name: string;
    description: string;
    price: number;
    category: string;
    image?: string;
}

export interface UpdateRestaurentMenuItemDTO {
    name?: string;
    description?: string;
    price?: number;
    category?: string;
    image?: string;
}

export interface RestaurentMenuItemFilterDTO {
    restaurentId?: Types.ObjectId;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
}

export interface PaginatedRestaurentMenuItemResult {
    menuItems: RestaurentMenuItem[];
    total: number;
    page: number;
    limit: number;
}

export interface RestaurentWithMenu extends Restaurent {
    menuItems: RestaurentMenuItem[];
}

export interface RestaurentOperatingHours {
    _id: Types.ObjectId;
    restaurentId: Types.ObjectId;
    dayOfWeek: string; // e.g., 'Monday'
    openTime: string; // e.g., '09:00'
    closeTime: string; // e.g., '22:00'
}

export interface CreateRestaurentOperatingHoursDTO {
    restaurentId: Types.ObjectId;
    dayOfWeek: string;
    openTime: string;
    closeTime: string;
}

export interface UpdateRestaurentOperatingHoursDTO {
    dayOfWeek?: string;
    openTime?: string;
    closeTime?: string;
}

export interface RestaurentOperatingHoursFilterDTO {
    restaurentId?: Types.ObjectId;
    dayOfWeek?: string;
}

export interface PaginatedRestaurentOperatingHoursResult {
    operatingHours: RestaurentOperatingHours[];
    total: number;
    page: number;
    limit: number;
}

export interface RestaurentWithOperatingHours extends Restaurent {
    operatingHours: RestaurentOperatingHours[];
}

export interface RestaurentReservation {
    _id: Types.ObjectId;
    restaurentId: Types.ObjectId;
    userId: Types.ObjectId;
    reservationTime: Date;
    numberOfGuests: number;
    specialRequests?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateRestaurentReservationDTO {
    restaurentId: Types.ObjectId;
    userId: Types.ObjectId;
    reservationTime: Date;
    numberOfGuests: number;
    specialRequests?: string;
}

export interface UpdateRestaurentReservationDTO {
    reservationTime?: Date;
    numberOfGuests?: number;
    specialRequests?: string;
}

export interface RestaurentReservationFilterDTO {
    restaurentId?: Types.ObjectId;
    userId?: Types.ObjectId;
    startTime?: Date;
    endTime?: Date;
}

export interface PaginatedRestaurentReservationResult {
    reservations: RestaurentReservation[];
    total: number;
    page: number;
    limit: number;
}

export interface RestaurentWithReservations extends Restaurent {
    reservations: RestaurentReservation[];
}

export interface RestaurentDeliveryOption {
    _id: Types.ObjectId;
    restaurentId: Types.ObjectId;
    isAvailable: boolean;
    deliveryFee: number;
    estimatedDeliveryTime: string; // e.g., '30-45 mins'
}

export interface UpdateRestaurentDeliveryOptionDTO {
    isAvailable?: boolean;
    deliveryFee?: number;
    estimatedDeliveryTime?: string;
}

export interface RestaurentDeliveryOptionFilterDTO {
    restaurentId?: Types.ObjectId;
    isAvailable?: boolean;
}

export interface PaginatedRestaurentDeliveryOptionResult {
    deliveryOptions: RestaurentDeliveryOption[];
    total: number;
    page: number;
    limit: number;
}

export interface RestaurentWithDeliveryOption extends Restaurent {
    deliveryOption: RestaurentDeliveryOption;
}

export interface RestaurentEvent {
    _id: Types.ObjectId;
    restaurentId: Types.ObjectId;
    title: string;
    description: string;
    eventDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateRestaurentEventDTO {
    restaurentId: Types.ObjectId;
    title: string;
    description: string;
    eventDate: Date;
}

export interface UpdateRestaurentEventDTO {
    title?: string;
    description?: string;
    eventDate?: Date;
}

export interface RestaurentEventFilterDTO {
    restaurentId?: Types.ObjectId;
    startDate?: Date;
    endDate?: Date;
}

export interface PaginatedRestaurentEventResult {
    events: RestaurentEvent[];
    total: number;
    page: number;
    limit: number;
}

export interface RestaurentWithEvents extends Restaurent {
    events: RestaurentEvent[];
}

export interface RestaurentPromotion {
    _id: Types.ObjectId;
    restaurentId: Types.ObjectId;
    title: string;
    description: string;
    discountPercentage: number;
    startDate: Date;
    endDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateRestaurentPromotionDTO {
    restaurentId: Types.ObjectId;
    title: string;
    description: string;
    discountPercentage: number;
    startDate: Date;
    endDate: Date;
}

export interface UpdateRestaurentPromotionDTO {
    title?: string;
    description?: string;
    discountPercentage?: number;
    startDate?: Date;
    endDate?: Date;
}

export interface RestaurentPromotionFilterDTO {
    restaurentId?: Types.ObjectId;
    activeOnly?: boolean;
}

export interface PaginatedRestaurentPromotionResult {
    promotions: RestaurentPromotion[];
    total: number;
    page: number;
    limit: number;
}

export interface RestaurentWithPromotions extends Restaurent {
    promotions: RestaurentPromotion[];
}

export interface RestaurentPhoto {
    _id: Types.ObjectId;
    restaurentId: Types.ObjectId;
    url: string;
    description?: string;
    uploadedAt: Date;
}

export interface UploadRestaurentPhotoDTO {
    restaurentId: Types.ObjectId;
    url: string;
    description?: string;
}

export interface RestaurentPhotoFilterDTO {
    restaurentId?: Types.ObjectId;
}

export interface PaginatedRestaurentPhotoResult {
    photos: RestaurentPhoto[];
    total: number;
    page: number;
    limit: number;
}

export interface RestaurentWithPhotos extends Restaurent {
    photos: RestaurentPhoto[];
}

export interface RestaurentTag {
    _id: Types.ObjectId;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateRestaurentTagDTO {
    name: string;
}

export interface UpdateRestaurentTagDTO {
    name?: string;
}

export interface RestaurentTagFilterDTO {
    name?: string;
}

export interface PaginatedRestaurentTagResult {
    tags: RestaurentTag[];
    total: number;
    page: number;
    limit: number;
}

export interface RestaurentWithTags extends Restaurent {
    tags: RestaurentTag[];
}

export interface RestaurentOwner {
    _id: Types.ObjectId;
    restaurentId: Types.ObjectId;
    ownerId: Types.ObjectId;
    role: string; // e.g., 'admin', 'manager'
    createdAt: Date;
    updatedAt: Date;
}

export interface AssignRestaurentOwnerDTO {
    restaurentId: Types.ObjectId;
    ownerId: Types.ObjectId;
    role: string;
}

export interface UpdateRestaurentOwnerDTO {
    role?: string;
}

export interface RestaurentOwnerFilterDTO {
    restaurentId?: Types.ObjectId;
    ownerId?: Types.ObjectId;
}

export interface PaginatedRestaurentOwnerResult {
    owners: RestaurentOwner[];
    total: number;
    page: number;
    limit: number;
}

export interface RestaurentWithOwners extends Restaurent {
    owners: RestaurentOwner[];
}

export interface RestaurentAuditLog {
    _id: Types.ObjectId;
    restaurentId: Types.ObjectId;
    action: string;
    performedBy: Types.ObjectId;
    timestamp: Date;
    details?: string;
}

export interface CreateRestaurentAuditLogDTO {
    restaurentId: Types.ObjectId;
    action: string;
    performedBy: Types.ObjectId;
    details?: string;
}

export interface RestaurentAuditLogFilterDTO {
    restaurentId?: Types.ObjectId;
    performedBy?: Types.ObjectId;
    startDate?: Date;
    endDate?: Date;
}

export interface PaginatedRestaurentAuditLogResult {
    auditLogs: RestaurentAuditLog[];
    total: number;
    page: number;
    limit: number;
}

export interface RestaurentWithAuditLogs extends Restaurent {
    auditLogs: RestaurentAuditLog[];
}

export interface RestaurentSubscription {
    _id: Types.ObjectId;
    restaurentId: Types.ObjectId;
    planName: string;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateRestaurentSubscriptionDTO {
    restaurentId: Types.ObjectId;
    planName: string;
    startDate: Date;
    endDate: Date;
}

export interface UpdateRestaurentSubscriptionDTO {
    planName?: string;
    startDate?: Date;
    endDate?: Date;
    isActive?: boolean;
}

export interface RestaurentSubscriptionFilterDTO {
    restaurentId?: Types.ObjectId;
    isActive?: boolean;
}

export interface PaginatedRestaurentSubscriptionResult {
    subscriptions: RestaurentSubscription[];
    total: number;
    page: number;
    limit: number;
}

export interface RestaurentWithSubscriptions extends Restaurent {
    subscriptions: RestaurentSubscription[];
}

export interface RestaurentCapacity {
    _id: Types.ObjectId;
    restaurentId: Types.ObjectId;
    totalSeats: number;
    availableSeats: number;
    lastUpdated: Date;
}

export interface UpdateRestaurentCapacityDTO {
    totalSeats?: number;
    availableSeats?: number;
}

export interface RestaurentCapacityFilterDTO {
    restaurentId?: Types.ObjectId;
}

export interface PaginatedRestaurentCapacityResult {
    capacities: RestaurentCapacity[];
    total: number;
    page: number;
    limit: number;
}

export interface RestaurentWithCapacity extends Restaurent {
    capacity: RestaurentCapacity;
}

export interface RestaurentHealthInspection {
    _id: Types.ObjectId;
    restaurentId: Types.ObjectId;
    inspectionDate: Date;
    score: number;
    violations: string[];
    inspectorName: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateRestaurentHealthInspectionDTO {
    restaurentId: Types.ObjectId;
    inspectionDate: Date;
    score: number;
    violations: string[];
    inspectorName: string;
}

export interface UpdateRestaurentHealthInspectionDTO {
    inspectionDate?: Date;
    score?: number;
    violations?: string[];
    inspectorName?: string;
}

export interface RestaurentHealthInspectionFilterDTO {
    restaurentId?: Types.ObjectId;
    minScore?: number;
    maxScore?: number;
    startDate?: Date;
    endDate?: Date;
}

export interface PaginatedRestaurentHealthInspectionResult {
    inspections: RestaurentHealthInspection[];
    total: number;
    page: number;
    limit: number;
}

export interface RestaurentWithHealthInspections extends Restaurent {
    healthInspections: RestaurentHealthInspection[];
}

export interface RestaurentSocialMedia {
    _id: Types.ObjectId;
    restaurentId: Types.ObjectId;
    platform: string; // e.g., 'Facebook', 'Instagram'
    url: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateRestaurentSocialMediaDTO {
    restaurentId: Types.ObjectId;
    platform: string;
    url: string;
}

export interface UpdateRestaurentSocialMediaDTO {
    platform?: string;
    url?: string;
}

export interface RestaurentSocialMediaFilterDTO {
    restaurentId?: Types.ObjectId;
    platform?: string;
}

export interface PaginatedRestaurentSocialMediaResult {
    socialMedias: RestaurentSocialMedia[];
    total: number;
    page: number;
    limit: number;
}

export interface RestaurentWithSocialMedias extends Restaurent {
    socialMedias: RestaurentSocialMedia[];
}

export interface RestaurentNotificationSetting {
    _id: Types.ObjectId;
    restaurentId: Types.ObjectId;
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    updatedAt: Date;
}

export interface UpdateRestaurentNotificationSettingDTO {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    pushNotifications?: boolean;
}

export interface RestaurentNotificationSettingFilterDTO {
    restaurentId?: Types.ObjectId;
}

export interface PaginatedRestaurentNotificationSettingResult {
    notificationSettings: RestaurentNotificationSetting[];
    total: number;
    page: number;
    limit: number;
}

export interface RestaurentWithNotificationSettings extends Restaurent {
    notificationSettings: RestaurentNotificationSetting[];
}

export interface RestaurentAnalytics {
    restaurentId: Types.ObjectId;
    totalVisitors: number;
    averageVisitDuration: number; // in minutes
    peakHours: string[]; // e.g., ['12:00-13:00', '19:00-20:00']
    monthlyRevenue: number[];
}

export interface RestaurentAnalyticsFilterDTO {
    restaurentId?: Types.ObjectId;
    startDate?: Date;
    endDate?: Date;
}

export interface PaginatedRestaurentAnalyticsResult {
    analytics: RestaurentAnalytics[];
    total: number;
    page: number;
    limit: number;
}

export interface RestaurentWithAnalytics extends Restaurent {
    analytics: RestaurentAnalytics;
} 

export interface RestaurentAccessibilityFeature {
    _id: Types.ObjectId;
    restaurentId: Types.ObjectId;
    feature: string; // e.g., 'Wheelchair Accessible', 'Braille Menu'
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateRestaurentAccessibilityFeatureDTO {
    restaurentId: Types.ObjectId;
    feature: string;
}

export interface UpdateRestaurentAccessibilityFeatureDTO {
    feature?: string;
}
export interface RestaurentAccessibilityFeatureFilterDTO {
    restaurentId?: Types.ObjectId;
    feature?: string;
}
export interface PaginatedRestaurentAccessibilityFeatureResult {
    features: RestaurentAccessibilityFeature[];
    total: number;
    page: number;
    limit: number;
}
export interface RestaurentWithAccessibilityFeatures extends Restaurent {
    accessibilityFeatures: RestaurentAccessibilityFeature[];
}