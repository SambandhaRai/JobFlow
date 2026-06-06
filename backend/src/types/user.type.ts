import z from "zod";

export const UserRoleEnum = z.enum(["user", "employer", "admin"]);

export const ResumeSchema = z.object({
    fileName: z.string().trim(),
    fileUrl: z.string().trim().min(1),
    fileSize: z.number().positive(),
    score: z.number().min(0).max(10).optional(),
    isDefault: z.boolean().default(false),
    uploadedAt: z.coerce.date().default(() => new Date()),
});

export const BaseUserSchema = z.object({
    fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
    email: z.email("Invalid email address"),
    phone: z.string().trim().min(10).max(15).optional(),
    password: z.string().trim().min(6, "Password must be at least 6 characters"),
    role: UserRoleEnum.default("user"),
});

export const JobSeekerSchema = BaseUserSchema.extend({
    role: z.literal("user").default("user"),
    skills: z.array(z.string().trim()).default([]),
    resumes: z.array(ResumeSchema).default([]),
    savedJobs: z.array(z.string().trim()).default([]),
});

export const EmployerSchema = BaseUserSchema.extend({
    role: z.literal("employer"),
    companyName: z.string().trim().min(1, "Company name is required"),
    companyWebsite: z.string().trim().optional(),
});

export type UserRoleType = z.infer<typeof UserRoleEnum>;
export type ResumeType = z.infer<typeof ResumeSchema>;
export type UserType = z.infer<typeof BaseUserSchema>;
export type JobSeekerType = z.infer<typeof JobSeekerSchema>;
export type EmployerType = z.infer<typeof EmployerSchema>;
