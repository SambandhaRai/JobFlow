import mongoose from "mongoose";
import { CreateReportDto } from "../dtos/report.dto";
import { HttpError } from "../errors/http-error";
import { ReportRepository } from "../repositories/report.repository";
import { JobRepository } from "../repositories/job.repository";
import { ReportStatusType } from "../types/report.type";

const reportRepository = new ReportRepository();
const jobRepository = new JobRepository();

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

        return await reportRepository.createReport({
            reporterId: new mongoose.Types.ObjectId(reporterId),
            jobId: new mongoose.Types.ObjectId(data.jobId),
            reason: data.reason,
            message: data.message,
        });
    }

    async getAllReports(params: ListReportsParams) {
        const page = params.page ?? 1;
        const size = params.size ?? 50;
        return await reportRepository.getAllReports({ ...params, page, size });
    }
}
