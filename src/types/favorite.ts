import { Types } from 'mongoose';

export enum FavoriteType {
    STORE = 'store',
    ITEM = 'item'
}

export enum FavoriteStoreType {
    RESTAURENT = 'Restaurent',
    MEDICAL = 'Medical',
    GROCERY = 'Grocery',
    CLOTHES = 'Clothes'
}

export enum FavoriteItemType {
    MENU_ITEM = 'MenuItem',
    MEDICAL_ITEM = 'MedicalItem',
    GROCERY_ITEM = 'GroceryItem',
    CLOTHES_ITEM = 'ClothesItem'
}

export interface Favorite {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    favoriteType: FavoriteType;
    
    // Store favorite
    storeType?: FavoriteStoreType;
    storeId?: Types.ObjectId;
    
    // Item favorite
    itemType?: FavoriteItemType;
    itemId?: Types.ObjectId;
    
    createdAt: Date;
    updatedAt: Date;
}

export interface AddFavoriteDTO {
    favoriteType: FavoriteType;
    storeType?: FavoriteStoreType;
    storeId?: string;
    itemType?: FavoriteItemType;
    itemId?: string;
}

export interface FavoriteFilterDTO {
    favoriteType?: FavoriteType;
    storeType?: FavoriteStoreType;
    itemType?: FavoriteItemType;
    page?: number;
    limit?: number;
}
