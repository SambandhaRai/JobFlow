import { Request, Response } from "express";
import z from "zod";
import { CreateReportDto } from "../dtos/report.dto";
import { ReportService } from "../services/report.service";
import { ReportStatusEnum } from "../types/report.type";

const reportService = new ReportService();

export class ReportController {
    async createReport(req: Request, res: Response) {
        try {
            const reporterId = req.user?.id;
            if (!reporterId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const parsedData = CreateReportDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error),
                });
            }

            const report = await reportService.createReport(parsedData.data, reporterId);
            return res.status(201).json({
                success: true,
                data: report,
                message: "Report submitted successfully",
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }

    async getAllReports(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const size = parseInt(req.query.size as string) || 50;
            const statusParam = req.query.status as string | undefined;

            let status;
            if (statusParam) {
                const parsed = ReportStatusEnum.safeParse(statusParam);
                if (!parsed.success) {
                    return res.status(400).json({ success: false, message: "Invalid status filter" });
                }
                status = parsed.data;
            }

            const result = await reportService.getAllReports({ page, size, status });
            return res.status(200).json({
                success: true,
                data: result.reports,
                totalReports: result.totalReports,
                message: "Reports fetched successfully",
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
}
