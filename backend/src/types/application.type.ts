import z from "zod";

export const ApplicationStatusEnum = z.enum([
    "submitted",
    "viewed_by_employer",
    "shortlisted",
    "interview_scheduled",
    "not_selected",
]);

export const ApplicationSchema = z.object({
    userId: z.string().trim(),
    jobId: z.string().trim(),
    postedByUserId: z.string().trim(),
    companyId: z.string().trim().optional(),
    // Stored as the resume's filename; the frontend resolves it to a URL.
    resumeUrl: z.string().trim().min(1, "Resume is required"),
    fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
    email: z.email("Invalid email address"),
    phone: z.string().trim().min(10).max(15),
    applicationNote: z.string().trim().max(1000, "Application note can't exceed 1000 characters").optional(),
    status: ApplicationStatusEnum.default("submitted"),
    appliedAt: z.coerce.date().default(() => new Date()),
    updatedAt: z.coerce.date().default(() => new Date()),
});

export type ApplicationStatusType = z.infer<typeof ApplicationStatusEnum>;
export type ApplicationType = z.infer<typeof ApplicationSchema>;
