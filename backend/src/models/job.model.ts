import mongoose, { Document, Schema } from "mongoose";
import { JobType } from "../types/job.type";

const SalarySchema: Schema = new Schema({
    min: { type: Number, required: true, min: 0 },
    max: { type: Number, required: true, min: 0 },
    currency: { type: String, trim: true },
}, { _id: false });

const JobSchema: Schema = new Schema({
    title: { type: String, required: true, trim: true, minLength: 2 },
    postedByUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    hiringType: {
        type: String,
        enum: ["company", "small-business", "individual"],
        default: "small-business",
    },
    companyId: { type: Schema.Types.ObjectId, ref: "Company" },
    company: { type: String, trim: true },
    hiringName: { type: String, required: true, trim: true, minLength: 2 },
    hiringEmail: { type: String, trim: true, lowercase: true },
    hiringPhone: { type: String, trim: true },
    hiringWebsite: { type: String, trim: true },
    hiringLocation: { type: String, trim: true },
    isHiringVerified: { type: Boolean, default: false },
    location: { type: String, required: true, trim: true, minLength: 2 },
    jobType: {
        type: String,
        enum: ["internship", "full-time", "part-time"],
        required: true,
    },
    workMode: {
        type: String,
        enum: ["on-site", "remote", "hybrid"],
        required: true,
    },
    experienceLevel: {
        type: String,
        enum: ["no-experience", "entry-level", "junior", "mid-level", "senior-level"],
        required: true,
    },
    category: {
        type: String,
        enum: [
            "IT & Software",
            "Design & Creative",
            "Marketing & Social Media",
            "Writing & Content",
            "Sales & Customer Service",
            "Business & Administration",
            "Finance & Accounting",
            "Education & Tutoring",
            "Hospitality & Tourism",
            "Retail & Store Jobs",
            "Data & Research",
            "Media & Communication",
            "Other",
        ],
        default: "Other",
    },
    salary: { type: SalarySchema, required: false },
    duration: { type: String, trim: true },
    skills: { type: [String], default: [] },
    description: { type: String, required: true, trim: true, minLength: 10 },
    responsibilities: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    isVerified: { type: Boolean, default: false },
    isBeginnerFriendly: { type: Boolean, default: false },
    deadline: { type: Date },
    postedAt: { type: Date, default: () => new Date() },
    seedTag: { type: String, trim: true },
}, {
    timestamps: true,
});

export interface IJob extends Omit<JobType, "postedByUserId" | "companyId">, Document {
    _id: mongoose.Types.ObjectId;
    postedByUserId: mongoose.Types.ObjectId;
    companyId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export const JobModel = mongoose.model<IJob>("Job", JobSchema);
