import mongoose, { Document, Schema } from "mongoose";
import { ReportType } from "../types/report.type";

const ReportSchema: Schema = new Schema({
    reporterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    reason: {
        type: String,
        enum: ["spam", "scam", "inappropriate", "misleading", "other"],
        default: "other",
    },
    message: { type: String, trim: true, maxLength: 1000 },
    status: {
        type: String,
        enum: ["open", "reviewed", "dismissed"],
        default: "open",
    },
}, {
    timestamps: true,
});

export interface IReport extends Omit<ReportType, "reporterId" | "jobId">, Document {
    _id: mongoose.Types.ObjectId;
    reporterId: mongoose.Types.ObjectId;
    jobId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export const ReportModel = mongoose.model<IReport>("Report", ReportSchema);
