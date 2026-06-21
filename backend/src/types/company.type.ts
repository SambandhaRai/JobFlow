import z from "zod";

export const CompanyMemberRoleEnum = z.enum(["owner", "recruiter", "viewer"]);

export const CompanyContactSchema = z.object({
    name: z.string().trim().optional(),
    email: z.email("Invalid email address").optional(),
    phone: z.string().trim().optional(),
    role: z.string().trim().optional(),
});

export const CompanyMemberSchema = z.object({
    userId: z.string().trim(),
    role: CompanyMemberRoleEnum.default("owner"),
});

export const CompanySchema = z.object({
    name: z.string().trim().min(2, "Company name must be at least 2 characters"),
    slug: z.string().trim().min(2),
    website: z.string().trim().optional(),
    logoUrl: z.string().trim().optional(),
    description: z.string().trim().optional(),
    industry: z.string().trim().optional(),
    location: z.string().trim().optional(),
    email: z.email("Invalid email address").optional(),
    phone: z.string().trim().optional(),
    contacts: z.array(CompanyContactSchema).default([]),
    isVerified: z.boolean().default(false),
    ownerId: z.string().trim(),
    members: z.array(CompanyMemberSchema).default([]),
});

export type CompanyMemberRoleType = z.infer<typeof CompanyMemberRoleEnum>;
export type CompanyContactType = z.infer<typeof CompanyContactSchema>;
export type CompanyMemberType = z.infer<typeof CompanyMemberSchema>;
export type CompanyType = z.infer<typeof CompanySchema>;
