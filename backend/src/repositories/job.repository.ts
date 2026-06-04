import mongoose, { QueryFilter } from "mongoose";
import { IJob, JobModel } from "../models/job.model";
import { JobTypeEnumType, WorkModeType, ExperienceLevelType } from "../types/job.type";

interface GetAllJobsParams {
    page: number;
    size: number;
    search?: string;
    jobType?: JobTypeEnumType;
    workMode?: WorkModeType;
    experienceLevel?: ExperienceLevelType;
    location?: string;
    isBeginnerFriendly?: boolean;
    isVerified?: boolean;
    employerId?: string;
}

export interface IJobRepository {
    createJob(data: Partial<IJob>): Promise<IJob>;
    getAllJobs(params: GetAllJobsParams): Promise<{ jobs: IJob[], totalJobs: number }>;
    getJobById(id: string): Promise<IJob | null>;
    updateOneJob(id: string, data: Partial<IJob>): Promise<IJob | null>;
    deleteOneJob(id: string): Promise<boolean | null>;

    verifyJob(id: string): Promise<IJob | null>;
}

export class JobRepository implements IJobRepository {

    async createJob(data: Partial<IJob>): Promise<IJob> {
        const job = new JobModel(data);
        return await job.save();
    }

    async getAllJobs({
        page,
        size,
        search,
        jobType,
        workMode,
        experienceLevel,
        location,
        isBeginnerFriendly,
        isVerified,
        employerId,
    }: GetAllJobsParams): Promise<{ jobs: IJob[], totalJobs: number }> {
        let filter: QueryFilter<IJob> = {};

        if (jobType) filter.jobType = jobType;
        if (workMode) filter.workMode = workMode;
        if (experienceLevel) filter.experienceLevel = experienceLevel;
        if (location) filter.location = { $regex: location, $options: "i" };
        if (typeof isBeginnerFriendly === "boolean") filter.isBeginnerFriendly = isBeginnerFriendly;
        if (typeof isVerified === "boolean") filter.isVerified = isVerified;
        if (employerId) filter.employerId = new mongoose.Types.ObjectId(employerId);

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { company: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { skills: { $regex: search, $options: "i" } },
            ];
        }

        const [jobs, totalJobs] = await Promise.all([
            JobModel.find(filter)
                .sort({ postedAt: -1 })
                .skip((page - 1) * size)
                .limit(size)
                .populate("employerId", "fullName email"),
            JobModel.countDocuments(filter)
        ]);

        return { jobs, totalJobs };
    }

    async getJobById(id: string): Promise<IJob | null> {
        const job = await JobModel.findById(id);
        return job;
    }

    async updateOneJob(id: string, data: Partial<IJob>): Promise<IJob | null> {
        const updatedJob = await JobModel.findByIdAndUpdate(id, data, { new: true });
        return updatedJob;
    }

    async deleteOneJob(id: string): Promise<boolean | null> {
        const result = await JobModel.findByIdAndDelete(id);
        return result ? true : null;
    }

    async verifyJob(id: string): Promise<IJob | null> {
        const updatedJob = await JobModel.findByIdAndUpdate(
            id,
            { $set: { isVerified: true } },
            { new: true }
        );
        return updatedJob;
    }

}