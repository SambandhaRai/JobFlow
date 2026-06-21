import mongoose, { Document, Schema } from "mongoose";
import { ApplicationType } from "../types/application.type";

const ApplicationSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    postedByUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    companyId: { type: Schema.Types.ObjectId, ref: "Company" },
    resumeUrl: { type: String, required: true },
    fullName: { type: String, required: true, trim: true, minLength: 2 },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true, minLength: 10, maxLength: 15 },
    applicationNote: { type: String, trim: true, maxLength: 1000 },
    status: {
        type: String,
        enum: ["submitted", "viewed_by_employer", "shortlisted", "interview_scheduled", "not_selected"],
        default: "submitted",
    },
    appliedAt: { type: Date, default: () => new Date() },
}, {
    timestamps: true,
});

ApplicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

export interface IApplication extends Omit<ApplicationType, "userId" | "jobId" | "postedByUserId" | "companyId">, Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    jobId: mongoose.Types.ObjectId;
    postedByUserId: mongoose.Types.ObjectId;
    companyId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export const ApplicationModel = mongoose.model<IApplication>("Application", ApplicationSchema);
