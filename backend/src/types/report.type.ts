import z from "zod";

export const ReportReasonEnum = z.enum([
    "spam",
    "scam",
    "inappropriate",
    "misleading",
    // Distinct from "scam": an upfront fee demand is the single most common
    // pattern reported by students, and admins need to see it on its own.
    "payment_request",
    // Distinct from "spam": a duplicate is usually an honest re-post.
    "duplicate",
    "other",
]);
export const ReportStatusEnum = z.enum(["open", "reviewed", "dismissed"]);

export const ReportSchema = z.object({
    reporterId: z.string().trim(),
    jobId: z.string().trim(),
    reason: ReportReasonEnum.default("other"),
    message: z.string().trim().max(1000, "Message can't exceed 1000 characters").optional(),
    status: ReportStatusEnum.default("open"),
});

export type ReportReasonType = z.infer<typeof ReportReasonEnum>;
export type ReportStatusType = z.infer<typeof ReportStatusEnum>;
export type ReportType = z.infer<typeof ReportSchema>;
