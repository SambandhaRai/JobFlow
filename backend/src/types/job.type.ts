import z from "zod";

export const JobTypeEnum = z.enum(["internship", "full-time", "part-time"]);
export const WorkModeEnum = z.enum(["on-site", "remote", "hybrid"]);
export const ExperienceLevelEnum = z.enum(["no-experience", "entry-level", "junior", "mid-level", "senior-level"]);
export const HiringTypeEnum = z.enum(["company", "small-business", "individual"]);
export const JobCategoryEnum = z.enum([
    "IT & Software",
    "Design & Creative",
    "Marketing & Social Media",
    "Writing & Content",
    "Sales & Customer Service",
    "Business & Administration",
    "Finance & Accounting",
    "Education & Tutoring",
    "Hospitality & Tourism",
    "Retail & Store Jobs",
    "Data & Research",
    "Media & Communication",
    "Other",
]);

export const SalarySchema = z.object({
    min: z.number().nonnegative(),
    max: z.number().nonnegative(),
    currency: z.string().trim().optional(),
}).refine((data) => data.max >= data.min, {
    message: "Max salary must be greater than or equal to min salary",
});

export const JobBaseSchema = z.object({
    title: z.string().trim().min(2, "Job title must be at least 2 characters"),
    postedByUserId: z.string().trim(),
    hiringType: HiringTypeEnum.default("small-business"),
    companyId: z.string().trim().optional(),
    company: z.string().trim().optional(),
    hiringName: z.string().trim().min(2, "Hiring name must be at least 2 characters").optional(),
    hiringEmail: z.email("Invalid hiring email").optional(),
    hiringPhone: z.string().trim().optional(),
    hiringWebsite: z.string().trim().optional(),
    hiringLocation: z.string().trim().optional(),
    isHiringVerified: z.boolean().default(false),
    location: z.string().trim().min(2, "Location must be at least 2 characters"),
    jobType: JobTypeEnum,
    workMode: WorkModeEnum,
    experienceLevel: ExperienceLevelEnum,
    category: JobCategoryEnum.default("Other"),
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

type HiringValidationData = {
    hiringType?: z.infer<typeof HiringTypeEnum>;
    companyId?: string;
    hiringName?: string;
    hiringEmail?: string;
    hiringPhone?: string;
};

export function validateJobHiringDetails(data: HiringValidationData, ctx: z.RefinementCtx) {
    if (data.hiringType === "company" && !data.companyId) {
        ctx.addIssue({
            code: "custom",
            path: ["companyId"],
            message: "Company jobs require a companyId",
        });
    }

    if (data.hiringType !== "company" && !data.hiringName) {
        ctx.addIssue({
            code: "custom",
            path: ["hiringName"],
            message: "Small business and individual jobs require a hiring name",
        });
    }

    if (data.hiringType !== "company" && !data.hiringEmail && !data.hiringPhone) {
        ctx.addIssue({
            code: "custom",
            path: ["hiringEmail"],
            message: "Small business and individual jobs need at least one contact method",
        });
    }
}

export const JobSchema = JobBaseSchema.superRefine(validateJobHiringDetails);

export type JobTypeEnumType = z.infer<typeof JobTypeEnum>;
export type WorkModeType = z.infer<typeof WorkModeEnum>;
export type ExperienceLevelType = z.infer<typeof ExperienceLevelEnum>;
export type HiringTypeType = z.infer<typeof HiringTypeEnum>;
export type JobCategoryType = z.infer<typeof JobCategoryEnum>;
export type SalaryType = z.infer<typeof SalarySchema>;
export type JobType = z.infer<typeof JobSchema>;
