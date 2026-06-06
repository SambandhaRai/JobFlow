import z from "zod";

export const JobTypeEnum = z.enum(["internship", "full-time", "part-time"]);
export const WorkModeEnum = z.enum(["on-site", "remote", "hybrid"]);
export const ExperienceLevelEnum = z.enum(["no-experience", "entry-level", "junior", "mid-level", "senior-level"]);

export const SalarySchema = z.object({
    min: z.number().nonnegative(),
    max: z.number().nonnegative(),
    currency: z.string().trim().optional(),
}).refine((data) => data.max >= data.min, {
    message: "Max salary must be greater than or equal to min salary",
});

export const JobSchema = z.object({
    title: z.string().trim().min(2, "Job title must be at least 2 characters"),
    company: z.string().trim().min(2, "Company name must be at least 2 characters"),
    employerId: z.string().trim(),
    location: z.string().trim().min(2, "Location must be at least 2 characters"),
    jobType: JobTypeEnum,
    workMode: WorkModeEnum,
    experienceLevel: ExperienceLevelEnum,
    salary: SalarySchema.optional(),
    duration: z.string().trim().optional(),
    skills: z.array(z.string().trim()).default([]),
    description: z.string().trim().min(10, "Description must be at least 10 characters"),
    responsibilities: z.array(z.string().trim()).default([]),
    requirements: z.array(z.string().trim()).default([]),
    isVerified: z.boolean().default(false),
    isBeginnerFriendly: z.boolean().default(false),
    deadline: z.coerce.date().optional(),
    postedAt: z.coerce.date().default(() => new Date()),
});

export type JobTypeEnumType = z.infer<typeof JobTypeEnum>;
export type WorkModeType = z.infer<typeof WorkModeEnum>;
export type ExperienceLevelType = z.infer<typeof ExperienceLevelEnum>;
export type SalaryType = z.infer<typeof SalarySchema>;
export type JobType = z.infer<typeof JobSchema>;
