import { CreateApplicationDto, UpdateApplicationStatusDto } from "../dtos/application.dto";
import { ApplicationRepository } from "../repositories/application.repository";
import { JobRepository } from "../repositories/job.repository";
import { CompanyRepository } from "../repositories/company.repository";
import { NotificationService } from "./notification.service";
import { HttpError } from "../errors/http-error";
import { ApplicationStatusType } from "../types/application.type";
import { UserRoleType } from "../types/user.type";
import mongoose from "mongoose";

let applicationRepository = new ApplicationRepository();
let jobRepository = new JobRepository();
let companyRepository = new CompanyRepository();
let notificationService = new NotificationService();

interface ListApplicationsParams {
    page?: number;
    size?: number;
    status?: ApplicationStatusType;
}

export class ApplicationService {

    async applyToJob(data: CreateApplicationDto, authenticatedUserId: string, userRole: UserRoleType) {
        if (userRole !== "user") {
            throw new HttpError(403, "Only job seekers can apply to jobs");
        }
        if (!mongoose.Types.ObjectId.isValid(authenticatedUserId)) {
            throw new HttpError(400, "Invalid user ID");
        }
        if (!mongoose.Types.ObjectId.isValid(data.jobId)) {
            throw new HttpError(400, "Invalid job ID");
        }

        const job = await jobRepository.getJobById(data.jobId);
        if (!job) {
            throw new HttpError(404, "Job not found");
        }

        if (!job.isVerified) {
            throw new HttpError(403, "This job is not currently accepting applications");
        }

        if (job.deadline && new Date(job.deadline) < new Date()) {
            throw new HttpError(403, "Application deadline has passed");
        }

        const alreadyApplied = await applicationRepository.hasUserAppliedToJob(
            authenticatedUserId,
            data.jobId
        );
        if (alreadyApplied) {
            throw new HttpError(409, "You have already applied to this job");
        }

        const applicationData = {
            ...data,
            userId: new mongoose.Types.ObjectId(authenticatedUserId),
            jobId: new mongoose.Types.ObjectId(data.jobId),
            postedByUserId: job.postedByUserId,
            companyId: job.companyId,
        };

        return await applicationRepository.createApplication(applicationData);
    }

    async getMyApplications(userId: string, params: ListApplicationsParams) {
        const page = params.page ?? 1;
        const size = params.size ?? 50;
        return await applicationRepository.getAllApplications({
            ...params,
            page,
            size,
            userId,
        });
    }

    async getApplicationsForJob(jobId: string, requesterId: string, requesterRole: UserRoleType, params: ListApplicationsParams) {
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            throw new HttpError(400, "Invalid job ID");
        }

        const job = await jobRepository.getJobById(jobId);
        if (!job) {
            throw new HttpError(404, "Job not found");
        }

        const isPoster = job.postedByUserId.toString() === requesterId;
        const isCompanyMember = job.companyId
            ? await companyRepository.isCompanyMember(job.companyId.toString(), requesterId)
            : false;

        if (requesterRole !== "admin" && !isPoster && !isCompanyMember) {
            throw new HttpError(403, "Not authorized to view applications for this job");
        }

        if (requesterRole !== "admin") {
            await this.markJobApplicationsViewed(jobId, job.title);
        }

        const page = params.page ?? 1;
        const size = params.size ?? 20;
        return await applicationRepository.getAllApplications({
            ...params,
            page,
            size,
            jobId,
        });
    }

    async getEmployerApplications(posterId: string, params: ListApplicationsParams) {
        const page = params.page ?? 1;
        const size = params.size ?? 20;
        return await applicationRepository.getAllApplications({
            ...params,
            page,
            size,
            postedByUserId: posterId,
        });
    }

    async getAllApplications(params: ListApplicationsParams) {
        const page = params.page ?? 1;
        const size = params.size ?? 20;
        return await applicationRepository.getAllApplications({ ...params, page, size });
    }

    async getApplicationById(applicationId: string, requesterId: string, requesterRole: UserRoleType) {
        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            throw new HttpError(400, "Invalid application ID");
        }

        const application = await applicationRepository.getApplicationById(applicationId);
        if (!application) {
            throw new HttpError(404, "Application not found");
        }

        if (requesterRole !== "admin") {
            const isOwner =
                application.userId.toString() === requesterId ||
                application.postedByUserId.toString() === requesterId ||
                Boolean(
                    application.companyId &&
                    await companyRepository.isCompanyMember(application.companyId.toString(), requesterId)
                );
            if (!isOwner) {
                throw new HttpError(403, "Not authorized to view this application");
            }
        }

        return application;
    }

    async updateApplicationStatus(applicationId: string, data: UpdateApplicationStatusDto, requesterId: string, requesterRole: UserRoleType) {
        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            throw new HttpError(400, "Invalid application ID");
        }

        const application = await applicationRepository.getApplicationById(applicationId);
        if (!application) {
            throw new HttpError(404, "Application not found");
        }

        const canManage =
            application.postedByUserId.toString() === requesterId ||
            Boolean(
                application.companyId &&
                await companyRepository.isCompanyMember(application.companyId.toString(), requesterId)
            );

        if (requesterRole !== "admin" && !canManage) {
            throw new HttpError(403, "Not authorized to update this application");
        }

        const updated = await applicationRepository.updateApplicationStatus(applicationId, data.status);

        if (updated && data.status !== application.status) {
            const job = await jobRepository.getJobById(application.jobId.toString());
            await notificationService.notifyApplicationStatus(updated, data.status, job?.title);
        }

        return updated;
    }

    private async markJobApplicationsViewed(jobId: string, jobTitle?: string): Promise<void> {
        const submitted = await applicationRepository.getSubmittedApplicationsForJob(jobId);
        if (submitted.length === 0) return;

        await applicationRepository.markApplicationsViewed(submitted.map((application) => application._id));

        await Promise.all(
            submitted.map((application) =>
                notificationService.notifyApplicationStatus(application, "viewed_by_employer", jobTitle)
            )
        );
    }

    async withdrawApplication(applicationId: string, requesterId: string, requesterRole: UserRoleType) {
        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            throw new HttpError(400, "Invalid application ID");
        }

        const application = await applicationRepository.getApplicationById(applicationId);
        if (!application) {
            throw new HttpError(404, "Application not found");
        }

        if (requesterRole !== "admin" && application.userId.toString() !== requesterId) {
            throw new HttpError(403, "Not authorized to withdraw this application");
        }

        return await applicationRepository.deleteOneApplication(applicationId);
    }
}
