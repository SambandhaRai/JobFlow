import mongoose, { Document, Schema } from "mongoose";
import { ResumeType, UserRoleType, UserType } from "../types/user.type";

const ResumeSchema: Schema = new Schema({
    fileName: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true },
    fileSize: { type: Number, required: true, min: 0 },
    score: { type: Number, min: 0, max: 10 },
    isDefault: { type: Boolean, default: false },
    uploadedAt: { type: Date, default: () => new Date() },
}, { _id: true });

const EducationSchema: Schema = new Schema({
    level: {
        type: String,
        enum: ["see", "+2", "diploma", "bachelor", "master", "phd", "other"],
        required: true,
    },
    institutionName: { type: String, required: true, trim: true },
    status: {
        type: String,
        enum: ["currently-studying", "completed"],
        required: true,
    },
    completionYear: { type: String, trim: true },
}, { _id: true });

const UserSchema: Schema = new Schema({
    fullName: { type: String, required: true, trim: true, minLength: 2 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, minLength: 10, maxLength: 15 },
    password: { type: String, required: true, minLength: 6 },
    role: { type: String, enum: ["user", "employer", "admin"], default: "user" },
    profilePicture: { type: String },
    isVerified: { type: Boolean, default: false },
    seedTag: { type: String, trim: true },
}, {
    discriminatorKey: "role",
    timestamps: true,
});

UserSchema.set("toJSON", {
    transform: (_doc, ret) => {
        const serialized = ret as Record<string, unknown>;
        delete serialized.password;
        delete serialized.__v;
        return ret;
    },
});

const JobSeekerSchema: Schema = new Schema({
    educations: { type: [EducationSchema], default: [] },
    skills: { type: [String], default: [] },
    resumes: { type: [ResumeSchema], default: [] },
    savedJobs: [{ type: Schema.Types.ObjectId, ref: "Job" }],
});

const EmployerSchema: Schema = new Schema({});

const AdminSchema: Schema = new Schema({});

export interface IResume extends ResumeType {
    _id: mongoose.Types.ObjectId;
}

export interface IEducation {
    _id: mongoose.Types.ObjectId;
    level: "see" | "+2" | "diploma" | "bachelor" | "master" | "phd" | "other";
    institutionName: string;
    status: "currently-studying" | "completed";
    completionYear?: string;
}

export interface IUser extends UserType, Document {
    _id: mongoose.Types.ObjectId;
    role: UserRoleType;
    createdAt: Date;
    updatedAt: Date;
}

export interface IJobSeeker extends IUser {
    role: "user";
    educations: IEducation[];
    skills: string[];
    resumes: IResume[];
    savedJobs: mongoose.Types.ObjectId[];
}

export interface IEmployer extends IUser {
    role: "employer";
}

export interface IAdmin extends IUser {
    role: "admin";
}

export const UserModel = mongoose.model<IUser>("User", UserSchema);
export const JobSeekerModel = UserModel.discriminator<IJobSeeker>("JobSeeker", JobSeekerSchema, "user");
export const EmployerModel = UserModel.discriminator<IEmployer>("Employer", EmployerSchema, "employer");
export const AdminModel = UserModel.discriminator<IAdmin>("Admin", AdminSchema, "admin");
