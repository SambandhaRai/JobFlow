import mongoose, { Document, Schema } from "mongoose";
import { UserType, ResumeType } from "../types/user.type";

const ResumeSchema: Schema = new Schema({
    fileName: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true },
    fileSize: { type: Number, required: true, min: 0 },
    score: { type: Number, min: 0, max: 10 },
    isDefault: { type: Boolean, default: false },
    uploadedAt: { type: Date, default: () => new Date() },
}, { _id: true });

const UserSchema: Schema = new Schema({
    fullName: { type: String, required: true, trim: true, minLength: 2 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, minLength: 10, maxLength: 15 },
    password: { type: String, required: true, minLength: 6 },
    role: { type: String, enum: ["user", "employer", "admin"], default: "user" },
    skills: { type: [String], default: [] },
    resumes: { type: [ResumeSchema], default: [] },
    savedJobs: [{ type: Schema.Types.ObjectId, ref: "Job" }],
}, {
    timestamps: true,
});

export interface IResume extends ResumeType {
    _id: mongoose.Types.ObjectId;
}

export interface IUser extends Omit<UserType, "resumes" | "savedJobs">, Document {
    _id: mongoose.Types.ObjectId;
    resumes: IResume[];
    savedJobs: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

export const UserModel = mongoose.model<IUser>("User", UserSchema);