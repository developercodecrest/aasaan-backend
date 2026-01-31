import { Types } from "mongoose";

export enum RiderStatus {
    AVAILABLE = "available",
    BUSY = "busy",
    OFFLINE = "offline"
}

export enum VehicleType {
    BIKE = "bike",
    SCOOTER = "scooter",
    BICYCLE = "bicycle",
    CAR = "car"
}

export interface Location {
    latitude: number;
    longitude: number;
    address?: string;
}

export interface Documents {
    drivingLicense?: string;
    vehicleRegistration?: string;
    aadharCard?: string;
    panCard?: string;
}

export interface Rider {
    _id: Types.ObjectId;
    name: string;
    phone: string;
    email?: string;
    password: string;
    vehicleType: VehicleType;
    vehicleNumber: string;
    licenseNumber: string;
    status: RiderStatus;
    currentLocation?: Location;
    documents?: Documents;
    rating: number;
    totalDeliveries: number;
    isActive: boolean;
    profileImage?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateRiderDTO {
    name: string;
    phone: string;
    email?: string;
    password: string;
    vehicleType: VehicleType;
    vehicleNumber: string;
    licenseNumber: string;
    documents?: Documents;
    profileImage?: string;
}

export interface UpdateRiderDTO {
    name?: string;
    phone?: string;
    email?: string;
    password?: string;
    vehicleType?: VehicleType;
    vehicleNumber?: string;
    licenseNumber?: string;
    status?: RiderStatus;
    currentLocation?: Location;
    documents?: Documents;
    isActive?: boolean;
    profileImage?: string;
}

export interface AssignOrderDTO {
    riderId: Types.ObjectId;
    orderId: Types.ObjectId;
    userId: Types.ObjectId;
}

export interface RiderFilterDTO {
    name?: string;
    phone?: string;
    status?: RiderStatus;
    vehicleType?: VehicleType;
    isActive?: boolean;
    minRating?: number;
}

export interface RiderQueryOptions {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedRiderResult {
    riders: Rider[];
    total: number;
    page: number;
    limit: number;
}
