import { Types } from "mongoose";

export interface GroceryItem {
    _id: Types.ObjectId;
    groceryId: Types.ObjectId;
    name: string;
    description: string;
    price: number;
    category: string; // fruits, vegetables, dairy, bakery, beverages, etc.
    image?: string;
    isAvailable: boolean;
    brand?: string;
    unit: string; // kg, g, l, ml, pieces
    quantity: number;
    stock: number;
    organic: boolean;
    expiryDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateGroceryItemDTO {
    groceryId: Types.ObjectId;
    name: string;
    description: string;
    price: number;
    category: string;
    image?: string;
    isAvailable?: boolean;
    brand?: string;
    unit: string;
    quantity: number;
    stock?: number;
    organic?: boolean;
    expiryDate?: Date;
}

export interface UpdateGroceryItemDTO {
    name?: string;
    description?: string;
    price?: number;
    category?: string;
    image?: string;
    isAvailable?: boolean;
    brand?: string;
    unit?: string;
    quantity?: number;
    stock?: number;
    organic?: boolean;
    expiryDate?: Date;
}

export interface GroceryItemFilterDTO {
    groceryId?: Types.ObjectId;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    isAvailable?: boolean;
    organic?: boolean;
    searchBy?: string;
}

export interface PaginatedGroceryItemResult {
    groceryItems: GroceryItem[];
    total: number;
    page: number;
    limit: number;
}
