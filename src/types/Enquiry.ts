import { Types } from "mongoose";
import { GSTDetails } from ".";

export enum EnquiryStatus {
    PENDING = "pending",
    RESPONDED = "responded",
    CLOSED = "closed"
}

export interface IEnquiry {
    _id: Types.ObjectId;
    fullname: string;
    email: string;
    phone: string;
    gstDetails?: GSTDetails;
    status: EnquiryStatus;
    message?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface EnquiriesQuery {
    status?: EnquiryStatus;
    email?: string;
    phone?: string;
    createdBefore?: string | Date;
    createdAfter?: string | Date;
    sortBy?: 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
}