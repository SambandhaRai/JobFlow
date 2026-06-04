import mongoose, { Document, Schema } from "mongoose";
import { JobType } from "../types/job.type";

const SalarySchema: Schema = new Schema({
    min: { type: Number, required: true, min: 0 },
    max: { type: Number, required: true, min: 0 },
}, { _id: false });

const JobSchema: Schema = new Schema({
    title: { type: String, required: true, trim: true, minLength: 2 },
    company: { type: String, required: true, trim: true, minLength: 2 },
    employerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
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
}, {
    timestamps: true,
});

export interface IJob extends Omit<JobType, "employerId">, Document {
    _id: mongoose.Types.ObjectId;
    employerId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export const JobModel = mongoose.model<IJob>("Job", JobSchema);