import z from "zod";
import { ReportSchema, ReportStatusEnum } from "../types/report.type";

export const CreateReportDto = ReportSchema.pick({
    jobId: true,
    reason: true,
    message: true,
});
export type CreateReportDto = z.infer<typeof CreateReportDto>;

export const UpdateReportStatusDto = z.object({
    status: ReportStatusEnum,
});
export type UpdateReportStatusDto = z.infer<typeof UpdateReportStatusDto>;
