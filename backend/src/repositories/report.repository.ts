import mongoose, { QueryFilter } from "mongoose";
import { IReport, ReportModel } from "../models/report.model";
import { ReportStatusType } from "../types/report.type";

interface GetAllReportsParams {
    page: number;
    size: number;
    status?: ReportStatusType;
}

export class ReportRepository {
    async createReport(data: Partial<IReport>): Promise<IReport> {
        const report = new ReportModel(data);
        return await report.save();
    }

    async findByReporterAndJob(reporterId: string, jobId: string): Promise<IReport | null> {
        return await ReportModel.findOne({ reporterId, jobId });
    }

    async findById(id: string): Promise<IReport | null> {
        return await ReportModel.findById(id);
    }

    async updateStatus(id: string, status: ReportStatusType): Promise<IReport | null> {
        return await ReportModel.findByIdAndUpdate(
            id,
            { $set: { status } },
            { returnDocument: "after" },
        );
    }

    async getReportsForReporter({
        reporterId,
        page,
        size,
    }: {
        reporterId: string;
        page: number;
        size: number;
    }): Promise<{ reports: IReport[]; totalReports: number }> {
        const filter = { reporterId: new mongoose.Types.ObjectId(reporterId) };

        const [reports, totalReports] = await Promise.all([
            ReportModel.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * size)
                .limit(size)
                .populate("jobId", "title hiringName company location companyId"),
            ReportModel.countDocuments(filter),
        ]);

        return { reports, totalReports };
    }

    async getAllReports({
        page,
        size,
        status,
    }: GetAllReportsParams): Promise<{ reports: IReport[]; totalReports: number }> {
        const filter: QueryFilter<IReport> = {};
        if (status) filter.status = status;

        const [reports, totalReports] = await Promise.all([
            ReportModel.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * size)
                .limit(size)
                .populate("reporterId", "fullName email role")
                .populate("jobId", "title hiringName company location"),
            ReportModel.countDocuments(filter),
        ]);

        return { reports, totalReports };
    }
}
