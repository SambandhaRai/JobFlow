import { CreateJobDto, UpdateJobDto } from "../dtos/job.dto";
import { JobRepository } from "../repositories/job.repository";
import { ApplicationRepository } from "../repositories/application.repository";
import { CompanyRepository } from "../repositories/company.repository";
import { HttpError } from "../errors/http-error";
import { HiringTypeType, JobCategoryType, JobTypeEnumType, WorkModeType, ExperienceLevelType } from "../types/job.type";
import { UserRoleType } from "../types/user.type";
import mongoose from "mongoose";

let jobRepository = new JobRepository();
let applicationRepository = new ApplicationRepository();
let companyRepository = new CompanyRepository();

interface GetAllJobsServiceParams {
    page?: number;
    size?: number;
    search?: string;
    jobType?: JobTypeEnumType;
    workMode?: WorkModeType;
    experienceLevel?: ExperienceLevelType;
    category?: JobCategoryType;
    location?: string;
    minSalary?: number;
    maxSalary?: number;
    isBeginnerFriendly?: boolean;
    isVerified?: boolean;
    postedByUserId?: string;
    companyId?: string;
    hiringType?: HiringTypeType;
}

export class JobService {

    async createJob(data: CreateJobDto, authenticatedEmployerId: string) {
        if (!mongoose.Types.ObjectId.isValid(authenticatedEmployerId)) {
            throw new HttpError(400, "Invalid employer ID");
        }

        const hiringType = data.hiringType ?? "small-business";
        let companyId: mongoose.Types.ObjectId | undefined;
        let companyName = data.hiringName;
        let isHiringVerified = false;
        let hiringEmail = data.hiringEmail;
        let hiringPhone = data.hiringPhone;
        let hiringWebsite = data.hiringWebsite;
        let hiringLocation = data.hiringLocation;

        if (hiringType === "company") {
            if (!data.companyId || !mongoose.Types.ObjectId.isValid(data.companyId)) {
                throw new HttpError(400, "Valid companyId is required for company jobs");
            }

            const company = await companyRepository.getCompanyById(data.companyId);
            if (!company) {
                throw new HttpError(404, "Company not found");
            }

            const isMember = await companyRepository.isCompanyMember(data.companyId, authenticatedEmployerId);
            if (!isMember) {
                throw new HttpError(403, "Not authorized to post jobs for this company");
            }

            companyId = company._id;
            companyName = company.name;
            isHiringVerified = company.isVerified;
            hiringEmail = data.hiringEmail ?? company.email;
            hiringPhone = data.hiringPhone ?? company.phone;
            hiringWebsite = data.hiringWebsite ?? company.website;
            hiringLocation = data.hiringLocation ?? company.location;
        }

        const jobData = {
            ...data,
            postedByUserId: new mongoose.Types.ObjectId(authenticatedEmployerId),
            hiringType,
            companyId,
            company: companyName ?? "Hiring profile",
            hiringName: companyName ?? "Hiring profile",
            hiringEmail,
            hiringPhone,
            hiringWebsite,
            hiringLocation,
            isHiringVerified,
        };

        return await jobRepository.createJob(jobData);
    }

    private async canManageJob(jobId: string, requesterId: string, requesterRole: UserRoleType) {
        if (requesterRole === "admin") return true;

        const job = await jobRepository.getJobById(jobId);
        if (!job) {
            throw new HttpError(404, "Job not found");
        }

        if (job.postedByUserId.toString() === requesterId) return true;

        if (job.companyId) {
            return await companyRepository.isCompanyMember(job.companyId.toString(), requesterId);
        }

        return false;
    }

    async getAllJobs(params: GetAllJobsServiceParams) {
        const page = params.page ?? 1;
        const size = params.size ?? 20;
        return await jobRepository.getAllJobs({ ...params, page, size });
    }

    async getJobById(jobId: string) {
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            throw new HttpError(400, "Invalid job ID");
        }
        const job = await jobRepository.getJobById(jobId);
        if (!job) {
            throw new HttpError(404, "Job not found");
        }
        return job;
    }

    async updateJob(jobId: string, data: UpdateJobDto, requesterId: string, requesterRole: UserRoleType) {
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            throw new HttpError(400, "Invalid job ID");
        }

        const job = await jobRepository.getJobById(jobId);
        if (!job) {
            throw new HttpError(404, "Job not found");
        }

        const canManage = await this.canManageJob(jobId, requesterId, requesterRole);
        if (!canManage) {
            throw new HttpError(403, "Not authorized to update this job");
        }

        const updateData = { ...data } as Partial<typeof job>;
        if (data.companyId) {
            if (!mongoose.Types.ObjectId.isValid(data.companyId)) {
                throw new HttpError(400, "Invalid company ID");
            }
            updateData.companyId = new mongoose.Types.ObjectId(data.companyId);
        }

        return await jobRepository.updateOneJob(jobId, updateData);
    }

    async deleteJob(jobId: string, requesterId: string, requesterRole: UserRoleType) {
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            throw new HttpError(400, "Invalid job ID");
        }

        const job = await jobRepository.getJobById(jobId);
        if (!job) {
            throw new HttpError(404, "Job not found");
        }

        const canManage = await this.canManageJob(jobId, requesterId, requesterRole);
        if (!canManage) {
            throw new HttpError(403, "Not authorized to delete this job");
        }

        // Cascade — remove all applications tied to this job
        await applicationRepository.deleteByJob(jobId);

        return await jobRepository.deleteOneJob(jobId);
    }

    async verifyJob(jobId: string) {
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            throw new HttpError(400, "Invalid job ID");
        }

        const job = await jobRepository.getJobById(jobId);
        if (!job) {
            throw new HttpError(404, "Job not found");
        }

        return await jobRepository.verifyJob(jobId);
    }
}
