import mongoose, { Document, Schema } from "mongoose";
import { CompanyType } from "../types/company.type";

const CompanyContactSchema: Schema = new Schema({
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    role: { type: String, trim: true },
}, { _id: false });

const CompanyMemberSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: {
        type: String,
        enum: ["owner", "recruiter", "viewer"],
        default: "owner",
    },
}, { _id: false });

const CompanySchema: Schema = new Schema({
    name: { type: String, required: true, trim: true, minLength: 2 },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
    website: { type: String, trim: true },
    logoUrl: { type: String, trim: true },
    description: { type: String, trim: true },
    industry: { type: String, trim: true },
    location: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    contacts: { type: [CompanyContactSchema], default: [] },
    isVerified: { type: Boolean, default: false },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: { type: [CompanyMemberSchema], default: [] },
    seedTag: { type: String, trim: true },
}, {
    timestamps: true,
});

CompanySchema.index({ ownerId: 1 });
CompanySchema.index({ "members.userId": 1 });

export interface ICompany extends Omit<CompanyType, "ownerId" | "members">, Document {
    _id: mongoose.Types.ObjectId;
    ownerId: mongoose.Types.ObjectId;
    members: Array<{
        userId: mongoose.Types.ObjectId;
        role: "owner" | "recruiter" | "viewer";
    }>;
    createdAt: Date;
    updatedAt: Date;
}

export const CompanyModel = mongoose.model<ICompany>("Company", CompanySchema);
