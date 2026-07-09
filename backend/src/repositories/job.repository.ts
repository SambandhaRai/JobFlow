import mongoose, { QueryFilter } from "mongoose";
import { IJob, JobModel } from "../models/job.model";
import { HiringTypeType, JobCategoryType, JobTypeEnumType, WorkModeType, ExperienceLevelType } from "../types/job.type";

interface GetAllJobsParams {
    page: number;
    size: number;
    search?: string;
    jobType?: JobTypeEnumType[];
    workMode?: WorkModeType[];
    experienceLevel?: ExperienceLevelType[];
    category?: JobCategoryType[];
    location?: string[];
    minSalary?: number;
    maxSalary?: number;
    isBeginnerFriendly?: boolean;
    isVerified?: boolean;
    postedByUserId?: string;
    companyId?: string;
    hiringType?: HiringTypeType;
}

export interface IJobRepository {
    createJob(data: Partial<IJob>): Promise<IJob>;
    getAllJobs(params: GetAllJobsParams): Promise<{ jobs: IJob[], totalJobs: number }>;
    getJobById(id: string): Promise<IJob | null>;
    getJobByIdWithRelations(id: string): Promise<IJob | null>;
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
        category,
        location,
        minSalary,
        maxSalary,
        isBeginnerFriendly,
        isVerified,
        postedByUserId,
        companyId,
        hiringType,
    }: GetAllJobsParams): Promise<{ jobs: IJob[], totalJobs: number }> {
        let filter: QueryFilter<IJob> = {};

        if (jobType?.length) filter.jobType = { $in: jobType };
        if (workMode?.length) filter.workMode = { $in: workMode };
        if (experienceLevel?.length) filter.experienceLevel = { $in: experienceLevel };
        if (category?.length) filter.category = { $in: category };
        if (location?.length === 1) filter.location = { $regex: location[0], $options: "i" };
        if (location && location.length > 1) filter.location = { $in: location };
        if (typeof minSalary === "number") filter["salary.max"] = { $gte: minSalary };
        if (typeof maxSalary === "number") filter["salary.min"] = { $lte: maxSalary };
        if (typeof isBeginnerFriendly === "boolean") filter.isBeginnerFriendly = isBeginnerFriendly;
        if (typeof isVerified === "boolean") filter.isVerified = isVerified;
        if (postedByUserId) filter.postedByUserId = new mongoose.Types.ObjectId(postedByUserId);
        if (companyId) filter.companyId = new mongoose.Types.ObjectId(companyId);
        if (hiringType) filter.hiringType = hiringType;

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
                .populate("postedByUserId", "fullName email")
                .populate("companyId", "name slug logoUrl isVerified"),
            JobModel.countDocuments(filter)
        ]);

        return { jobs, totalJobs };
    }

    async getJobById(id: string): Promise<IJob | null> {
        const job = await JobModel.findById(id);
        return job;
    }

    async getJobByIdWithRelations(id: string): Promise<IJob | null> {
        const job = await JobModel.findById(id)
            .populate("postedByUserId", "fullName email")
            .populate("companyId", "name slug logoUrl isVerified");
        return job;
    }

    async updateOneJob(id: string, data: Partial<IJob>): Promise<IJob | null> {
        const updatedJob = await JobModel.findByIdAndUpdate(id, data, { returnDocument: "after" });
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
            { returnDocument: "after" }
        );
        return updatedJob;
    }

}
