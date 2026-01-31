import { Types } from "mongoose";

export interface MedicalItem {
    _id: Types.ObjectId;
    medicalId: Types.ObjectId;
    name: string;
    description: string;
    price: number;
    category: string; // medicine, equipment, service
    image?: string;
    isAvailable: boolean;
    manufacturer?: string;
    expiryDate?: Date;
    prescriptionRequired: boolean;
    stock: number;
    dosageForm?: string; // tablet, syrup, injection, etc.
    strength?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateMedicalItemDTO {
    medicalId: Types.ObjectId;
    name: string;
    description: string;
    price: number;
    category: string;
    image?: string;
    isAvailable?: boolean;
    manufacturer?: string;
    expiryDate?: Date;
    prescriptionRequired?: boolean;
    stock?: number;
    dosageForm?: string;
    strength?: string;
}

export interface UpdateMedicalItemDTO {
    name?: string;
    description?: string;
    price?: number;
    category?: string;
    image?: string;
    isAvailable?: boolean;
    manufacturer?: string;
    expiryDate?: Date;
    prescriptionRequired?: boolean;
    stock?: number;
    dosageForm?: string;
    strength?: string;
}

export interface MedicalItemFilterDTO {
    medicalId?: Types.ObjectId;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    isAvailable?: boolean;
    prescriptionRequired?: boolean;
    searchBy?: string;
}

export interface PaginatedMedicalItemResult {
    medicalItems: MedicalItem[];
    total: number;
    page: number;
    limit: number;
}
