import { CreateJobDto, UpdateJobDto } from "../dtos/job.dto";
import { JobRepository } from "../repositories/job.repository";
import { ApplicationRepository } from "../repositories/application.repository";
import { UserRepository } from "../repositories/user.repository";
import { HttpError } from "../errors/http-error";
import { JobTypeEnumType, WorkModeType, ExperienceLevelType } from "../types/job.type";
import { UserRoleType } from "../types/user.type";
import mongoose from "mongoose";

let jobRepository = new JobRepository();
let applicationRepository = new ApplicationRepository();
let userRepository = new UserRepository();

interface GetAllJobsServiceParams {
    page?: number;
    size?: number;
    search?: string;
    jobType?: JobTypeEnumType;
    workMode?: WorkModeType;
    experienceLevel?: ExperienceLevelType;
    location?: string;
    isBeginnerFriendly?: boolean;
    isVerified?: boolean;
    employerId?: string;
}

export class JobService {

    async createJob(data: CreateJobDto, authenticatedEmployerId: string) {
        if (!mongoose.Types.ObjectId.isValid(authenticatedEmployerId)) {
            throw new HttpError(400, "Invalid employer ID");
        }

        const employer = await userRepository.getEmployerById(authenticatedEmployerId);
        if (!employer) {
            throw new HttpError(404, "Employer not found");
        }

        const jobData = {
            ...data,
            company: employer.companyName,
            employerId: new mongoose.Types.ObjectId(authenticatedEmployerId),
        };

        return await jobRepository.createJob(jobData);
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

        // Admin can edit any job; employer can only edit their own
        if (requesterRole !== "admin" && job.employerId.toString() !== requesterId) {
            throw new HttpError(403, "Not authorized to update this job");
        }

        return await jobRepository.updateOneJob(jobId, data);
    }

    async deleteJob(jobId: string, requesterId: string, requesterRole: UserRoleType) {
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            throw new HttpError(400, "Invalid job ID");
        }

        const job = await jobRepository.getJobById(jobId);
        if (!job) {
            throw new HttpError(404, "Job not found");
        }

        if (requesterRole !== "admin" && job.employerId.toString() !== requesterId) {
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
