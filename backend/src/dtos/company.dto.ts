import z from "zod";
import { CompanyContactSchema } from "../types/company.type";

export const CreateCompanyDto = z.object({
    name: z.string().trim().min(2, "Company name must be at least 2 characters"),
    website: z.string().trim().optional(),
    logoUrl: z.string().trim().optional(),
    description: z.string().trim().optional(),
    industry: z.string().trim().optional(),
    location: z.string().trim().optional(),
    email: z.email("Invalid email address").optional(),
    phone: z.string().trim().optional(),
    contacts: z.array(CompanyContactSchema).optional(),
});
export type CreateCompanyDto = z.infer<typeof CreateCompanyDto>;

export const UpdateCompanyDto = CreateCompanyDto.partial();
export type UpdateCompanyDto = z.infer<typeof UpdateCompanyDto>;
