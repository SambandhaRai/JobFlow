import mongoose, { QueryFilter } from "mongoose";
import { IApplication, ApplicationModel } from "../models/application.model";
import { ApplicationStatusType } from "../types/application.type";

interface GetAllApplicationsParams {
    page: number;
    size: number;
    status?: ApplicationStatusType;
    userId?: string;
    jobId?: string;
    employerId?: string;
}

export interface IApplicationRepository {
    createApplication(data: Partial<IApplication>): Promise<IApplication>;
    getAllApplications(params: GetAllApplicationsParams): Promise<{ applications: IApplication[], totalApplications: number }>;
    getApplicationById(id: string): Promise<IApplication | null>;
    updateApplicationStatus(id: string, status: ApplicationStatusType): Promise<IApplication | null>;
    deleteOneApplication(id: string): Promise<boolean | null>;
    hasUserAppliedToJob(userId: string, jobId: string): Promise<boolean>;
    deleteByJob(jobId: string): Promise<number>;
}

export class ApplicationRepository implements IApplicationRepository {

    async createApplication(data: Partial<IApplication>): Promise<IApplication> {
        const application = new ApplicationModel(data);
        return await application.save();
    }

    async getAllApplications({
        page,
        size,
        status,
        userId,
        jobId,
        employerId,
    }: GetAllApplicationsParams): Promise<{ applications: IApplication[], totalApplications: number }> {
        let filter: QueryFilter<IApplication> = {};

        if (status) filter.status = status;
        if (userId) filter.userId = new mongoose.Types.ObjectId(userId);
        if (jobId) filter.jobId = new mongoose.Types.ObjectId(jobId);
        if (employerId) filter.employerId = new mongoose.Types.ObjectId(employerId);

        const [applications, totalApplications] = await Promise.all([
            ApplicationModel.find(filter)
                .sort({ appliedAt: -1 })
                .skip((page - 1) * size)
                .limit(size)
                .populate("jobId", "title company location jobType workMode")
                .populate("userId", "fullName email phone"),
            ApplicationModel.countDocuments(filter)
        ]);

        return { applications, totalApplications };
    }

    async getApplicationById(id: string): Promise<IApplication | null> {
        const application = await ApplicationModel.findById(id);
        return application;
    }

    async updateApplicationStatus(id: string, status: ApplicationStatusType): Promise<IApplication | null> {
        const updatedApplication = await ApplicationModel.findByIdAndUpdate(
            id,
            { $set: { status } },
            { returnDocument: "after" }
        );
        return updatedApplication;
    }

    async deleteOneApplication(id: string): Promise<boolean | null> {
        const result = await ApplicationModel.findByIdAndDelete(id);
        return result ? true : null;
    }

    async hasUserAppliedToJob(userId: string, jobId: string): Promise<boolean> {
        const exists = await ApplicationModel.exists({
            userId: new mongoose.Types.ObjectId(userId),
            jobId: new mongoose.Types.ObjectId(jobId),
        });
        return !!exists;
    }

    async deleteByJob(jobId: string): Promise<number> {
        const result = await ApplicationModel.deleteMany({
            jobId: new mongoose.Types.ObjectId(jobId),
        });
        return result.deletedCount;
    }

}
