import { Types } from "mongoose";

export interface Medical {
    _id: Types.ObjectId;
    name: string;
    address: string;
    phone: string;
    category: string[]; // pharmacy, clinic, hospital, diagnostic-center
    rating: number;
    isOpen: boolean;
    images: string[];
    description: string;
    licenseNumber: string;
    emergencyServices: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateMedicalDTO {
    name: string;
    address: string;
    phone: string;
    category: string[];
    images?: string[];
    description?: string;
    licenseNumber: string;
    emergencyServices?: boolean;
}

export interface UpdateMedicalDTO {
    name?: string;
    address?: string;
    phone?: string;
    category?: string[];
    isOpen?: boolean;
    images?: string[];
    description?: string;
    licenseNumber?: string;
    emergencyServices?: boolean;
}

export interface MedicalFilterDTO {
    name?: string;
    category?: string[];
    minRating?: number;
    isOpen?: boolean;
    emergencyServices?: boolean;
}

export interface MedicalQueryOptions {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedMedicalResult {
    medicals: Medical[];
    total: number;
    page: number;
    limit: number;
}
