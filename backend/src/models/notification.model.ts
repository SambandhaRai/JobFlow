import mongoose, { Document, Schema } from "mongoose";
import { NotificationType } from "../types/notification.type";

const NotificationSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
        type: String,
        enum: [
            "application_viewed",
            "application_shortlisted",
            "application_interview_scheduled",
            "application_not_selected",
            "application_update",
        ],
        required: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    applicationId: { type: Schema.Types.ObjectId, ref: "Application" },
    jobId: { type: Schema.Types.ObjectId, ref: "Job" },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
}, {
    timestamps: true,
});

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });

export interface INotification extends Omit<NotificationType, "userId" | "applicationId" | "jobId">, Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    applicationId?: mongoose.Types.ObjectId;
    jobId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export const NotificationModel = mongoose.model<INotification>("Notification", NotificationSchema);
