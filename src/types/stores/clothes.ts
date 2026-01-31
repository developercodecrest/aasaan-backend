import { Types } from "mongoose";

export interface Clothes {
    _id: Types.ObjectId;
    name: string;
    address: string;
    phone: string;
    category: string[]; // fashion-store, boutique, department-store, sports-wear
    rating: number;
    isOpen: boolean;
    images: string[];
    description: string;
    brands: string[];
    returnPolicy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateClothesDTO {
    name: string;
    address: string;
    phone: string;
    category: string[];
    images?: string[];
    description?: string;
    brands?: string[];
    returnPolicy?: string;
}

export interface UpdateClothesDTO {
    name?: string;
    address?: string;
    phone?: string;
    category?: string[];
    isOpen?: boolean;
    images?: string[];
    description?: string;
    brands?: string[];
    returnPolicy?: string;
}

export interface ClothesFilterDTO {
    name?: string;
    category?: string[];
    minRating?: number;
    isOpen?: boolean;
}

export interface ClothesQueryOptions {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedClothesResult {
    clothes: Clothes[];
    total: number;
    page: number;
    limit: number;
}
