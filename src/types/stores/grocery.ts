import { Types } from "mongoose";

export interface Grocery {
    _id: Types.ObjectId;
    name: string;
    address: string;
    phone: string;
    category: string[]; // supermarket, convenience-store, organic-store
    rating: number;
    isOpen: boolean;
    images: string[];
    description: string;
    deliveryAvailable: boolean;
    minimumOrder: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateGroceryDTO {
    name: string;
    address: string;
    phone: string;
    category: string[];
    images?: string[];
    description?: string;
    deliveryAvailable?: boolean;
    minimumOrder?: number;
}

export interface UpdateGroceryDTO {
    name?: string;
    address?: string;
    phone?: string;
    category?: string[];
    isOpen?: boolean;
    images?: string[];
    description?: string;
    deliveryAvailable?: boolean;
    minimumOrder?: number;
}

export interface GroceryFilterDTO {
    name?: string;
    category?: string[];
    minRating?: number;
    isOpen?: boolean;
    deliveryAvailable?: boolean;
}

export interface GroceryQueryOptions {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedGroceryResult {
    groceries: Grocery[];
    total: number;
    page: number;
    limit: number;
}
