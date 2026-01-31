import { EnquiryStatus, IEnquiry } from "@/types/Enquiry";
import mongoose, { Schema } from "mongoose";
import { GSTDetailsSchema } from ".";

const enquirySchema = new Schema<IEnquiry>(
    {
        fullname: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        phone: { type: String, required: true, trim: true },
        gstDetails: GSTDetailsSchema,
        status: { type: String, enum: EnquiryStatus, default: EnquiryStatus.PENDING, index: true },
        message: { type: String, trim: true },
    },
    { timestamps: true }
)

export default mongoose.model<IEnquiry>("Enquiry", enquirySchema, "Enquiry");