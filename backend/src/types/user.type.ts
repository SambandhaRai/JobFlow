import z from "zod";

export const UserRoleEnum = z.enum(["user", "employer", "admin"]);
export const EducationLevelEnum = z.enum(["see", "+2", "diploma", "bachelor", "master", "phd", "other"]);
export const EducationStatusEnum = z.enum(["currently-studying", "completed"]);

export const ResumeSchema = z.object({
    fileName: z.string().trim(),
    fileUrl: z.string().trim().min(1),
    fileSize: z.number().positive(),
    score: z.number().min(0).max(10).optional(),
    isDefault: z.boolean().default(false),
    uploadedAt: z.coerce.date().default(() => new Date()),
});

export const EducationSchema = z.object({
    level: EducationLevelEnum,
    institutionName: z.string().trim().min(1, "Institution name is required"),
    status: EducationStatusEnum,
    completionYear: z.string().trim().optional(),
}).superRefine((data, ctx) => {
    if (!data.completionYear) {
        ctx.addIssue({
            code: "custom",
            path: ["completionYear"],
            message: data.status === "currently-studying"
                ? "Expected finish year is required"
                : "Finished year is required",
        });
        return;
    }

    if (!/^\d{4}$/.test(data.completionYear)) {
        ctx.addIssue({
            code: "custom",
            path: ["completionYear"],
            message: "Completion year must be a 4-digit year",
        });
        return;
    }

    if (
        data.status === "currently-studying" &&
        Number(data.completionYear) < new Date().getFullYear()
    ) {
        ctx.addIssue({
            code: "custom",
            path: ["completionYear"],
            message: "Expected finish year cannot be in the past",
        });
    }
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
    educations: z.array(EducationSchema).default([]),
    skills: z.array(z.string().trim()).default([]),
    resumes: z.array(ResumeSchema).default([]),
    savedJobs: z.array(z.string().trim()).default([]),
});

export const EmployerSchema = BaseUserSchema.extend({
    role: z.literal("employer"),
});

export type UserRoleType = z.infer<typeof UserRoleEnum>;
export type EducationLevelType = z.infer<typeof EducationLevelEnum>;
export type EducationStatusType = z.infer<typeof EducationStatusEnum>;
export type EducationType = z.infer<typeof EducationSchema>;
export type ResumeType = z.infer<typeof ResumeSchema>;
export type UserType = z.infer<typeof BaseUserSchema>;
export type JobSeekerType = z.infer<typeof JobSeekerSchema>;
export type EmployerType = z.infer<typeof EmployerSchema>;
