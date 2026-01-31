import { Types } from "mongoose";

export interface MenuItem {
    _id: Types.ObjectId;
    restaurentId: Types.ObjectId;
    name: string;
    description: string;
    price: number;
    category: string;
    image?: string;
    isAvailable: boolean;
    preparationTime?: number; // in minutes
    ingredients?: string[];
    allergens?: string[];
    nutritionalInfo?: {
        calories?: number;
        protein?: number;
        carbs?: number;
        fat?: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateMenuItemDTO {
    restaurentId: Types.ObjectId;
    name: string;
    description: string;
    price: number;
    category: string;
    image?: string;
    isAvailable?: boolean;
    preparationTime?: number;
    ingredients?: string[];
    allergens?: string[];
    nutritionalInfo?: {
        calories?: number;
        protein?: number;
        carbs?: number;
        fat?: number;
    };
}

export interface UpdateMenuItemDTO {
    name?: string;
    description?: string;
    price?: number;
    category?: string;
    image?: string;
    isAvailable?: boolean;
    preparationTime?: number;
    ingredients?: string[];
    allergens?: string[];
    nutritionalInfo?: {
        calories?: number;
        protein?: number;
        carbs?: number;
        fat?: number;
    };
}

export interface MenuItemFilterDTO {
    restaurentId?: Types.ObjectId;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    isAvailable?: boolean;
    searchBy?: string;
}

export interface MenuItemQueryOptions {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedMenuItemResult {
    menuItems: MenuItem[];
    total: number;
    page: number;
    limit: number;
}

export interface MenuItemStatistics {
    totalItems: number;
    averagePrice: number;
    categoriesCount: { [category: string]: number };
    availableItems: number;
}
