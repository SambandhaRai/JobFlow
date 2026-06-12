import { QueryFilter } from "mongoose";
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
