import { ObjectId } from "mongoose";
import { GSTDetails } from ".";

export enum UserRole {
    SADMIN = "SADMIN",
    USER = "USER",
    STORE_OWNER = "STORE_OWNER",
    RIDER="RIDER",
    AREA_MANAGER="AREA_MANAGER",
}

export enum UserStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
}

export interface IUser {
    _id?: ObjectId | string,
    userUId: string,
    username?: string;
    userRole: UserRole;
    email: string;
    photo?: string;
    fullname: string;
    phone: string;
    status: UserStatus;
    gstDetails?: GSTDetails;
    address?: string;
    dob?: Date;
    gender?: string;
    createdBy?: UserRole;
    createdAt?: Date;
    updatedAt?: Date;
    token?: string;
    lastLogin?: Date | null;
}