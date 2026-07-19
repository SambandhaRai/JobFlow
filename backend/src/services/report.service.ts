import mongoose from "mongoose";
import { CreateReportDto } from "../dtos/report.dto";
import { HttpError } from "../errors/http-error";
import { ReportRepository } from "../repositories/report.repository";
import { JobRepository } from "../repositories/job.repository";
import { NotificationService } from "./notification.service";
import { ReportStatusType } from "../types/report.type";

const reportRepository = new ReportRepository();
const jobRepository = new JobRepository();
const notificationService = new NotificationService();

interface ListReportsParams {
    page?: number;
    size?: number;
    status?: ReportStatusType;
}

export class ReportService {
    async createReport(data: CreateReportDto, reporterId: string) {
        if (!mongoose.Types.ObjectId.isValid(reporterId)) {
            throw new HttpError(400, "Invalid user ID");
        }
        if (!mongoose.Types.ObjectId.isValid(data.jobId)) {
            throw new HttpError(400, "Invalid job ID");
        }

        const job = await jobRepository.getJobById(data.jobId);
        if (!job) {
            throw new HttpError(404, "Job not found");
        }

        const existing = await reportRepository.findByReporterAndJob(reporterId, data.jobId);
        if (existing) {
            throw new HttpError(409, "You have already reported this listing.");
        }

        try {
            return await reportRepository.createReport({
                reporterId: new mongoose.Types.ObjectId(reporterId),
                jobId: new mongoose.Types.ObjectId(data.jobId),
                reason: data.reason,
                message: data.message,
            });
        } catch (error: any) {
            // The check above races with a rapid double-submit; the unique index
            // is the real guarantee, so translate its error to the same 409.
            if (error?.code === 11000) {
                throw new HttpError(409, "You have already reported this listing.");
            }
            throw error;
        }
    }

    async getAllReports(params: ListReportsParams) {
        const page = params.page ?? 1;
        const size = params.size ?? 50;
        return await reportRepository.getAllReports({ ...params, page, size });
    }

    async getMyReports(reporterId: string, params: { page?: number; size?: number }) {
        if (!mongoose.Types.ObjectId.isValid(reporterId)) {
            throw new HttpError(400, "Invalid user ID");
        }

        return await reportRepository.getReportsForReporter({
            reporterId,
            page: params.page ?? 1,
            size: params.size ?? 50,
        });
    }

    async updateStatus(reportId: string, status: ReportStatusType) {
        if (!mongoose.Types.ObjectId.isValid(reportId)) {
            throw new HttpError(400, "Invalid report ID");
        }

        const report = await reportRepository.findById(reportId);
        if (!report) {
            throw new HttpError(404, "Report not found");
        }

        if (report.status === status) {
            return report;
        }

        const updated = await reportRepository.updateStatus(reportId, status);
        if (!updated) {
            throw new HttpError(404, "Report not found");
        }

        // Tell the reporter what happened. "open" is the initial state, so
        // moving back to it is not an outcome worth notifying about.
        if (status === "reviewed" || status === "dismissed") {
            const job = await jobRepository.getJobById(report.jobId.toString());
            try {
                await notificationService.notifyReportStatus(
                    report.reporterId,
                    status,
                    job?.title,
                    report.jobId,
                );
            } catch {
                // A failed notification must not undo a completed moderation action.
            }
        }

        return updated;
    }
}
