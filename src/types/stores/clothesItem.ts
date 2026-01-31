import { Types } from "mongoose";

export interface ClothesItem {
    _id: Types.ObjectId;
    clothesId: Types.ObjectId;
    name: string;
    description: string;
    price: number;
    category: string; // men, women, kids, accessories
    image?: string;
    isAvailable: boolean;
    brand: string;
    size: string[]; // XS, S, M, L, XL, XXL
    color: string[];
    material: string;
    stock: number;
    gender: string; // male, female, unisex
    season?: string; // summer, winter, all-season
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateClothesItemDTO {
    clothesId: Types.ObjectId;
    name: string;
    description: string;
    price: number;
    category: string;
    image?: string;
    isAvailable?: boolean;
    brand: string;
    size: string[];
    color: string[];
    material: string;
    stock?: number;
    gender: string;
    season?: string;
}

export interface UpdateClothesItemDTO {
    name?: string;
    description?: string;
    price?: number;
    category?: string;
    image?: string;
    isAvailable?: boolean;
    brand?: string;
    size?: string[];
    color?: string[];
    material?: string;
    stock?: number;
    gender?: string;
    season?: string;
}

export interface ClothesItemFilterDTO {
    clothesId?: Types.ObjectId;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    isAvailable?: boolean;
    brand?: string;
    gender?: string;
    searchBy?: string;
}

export interface PaginatedClothesItemResult {
    clothesItems: ClothesItem[];
    total: number;
    page: number;
    limit: number;
}
