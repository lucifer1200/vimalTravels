// models/Enquiry.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEnquiry extends Document {
  fullName: string;
  phone: string;
  destination: string;
  travelDate?: string;
  message?: string;
  status: "new" | "contacted" | "closed";
  createdAt: Date;
  updatedAt: Date;
}

const EnquirySchema = new Schema<IEnquiry>(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    travelDate: { type: String },
    message: { type: String },
    status: {
      type: String,
      enum: ["new", "contacted", "closed"],
      default: "new",
    },
  },
  { timestamps: true }
);

const Enquiry: Model<IEnquiry> =
  mongoose.models.Enquiry || mongoose.model<IEnquiry>("Enquiry", EnquirySchema);

export default Enquiry;
