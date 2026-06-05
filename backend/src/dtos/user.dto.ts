import z from "zod";
import { BaseUserSchema, ResumeSchema } from "../types/user.type";

const CreateUserBaseDto = BaseUserSchema.pick({
    fullName: true,
    email: true,
    password: true,
    phone: true,
}).extend({
    confirmPassword: z.string().trim().min(6, "Password must be at least 6 characters"),
});

const CreateJobSeekerDto = CreateUserBaseDto.extend({
    role: z.literal("user"),
});

const CreateEmployerDto = CreateUserBaseDto.extend({
    role: z.literal("employer"),
    companyName: z.string().trim().min(1, "Company name is required"),
    companyWebsite: z.string().trim().optional(),
});

const CreateAdminDto = CreateUserBaseDto.extend({
    role: z.literal("admin"),
});

export const CreateUserDto = z.discriminatedUnion("role", [
    CreateJobSeekerDto,
    CreateEmployerDto,
    CreateAdminDto,
]).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    }
).refine(
    (data) => data.role !== "admin",
    {
        message: "Admin users cannot be created through registration",
        path: ["role"],
    }
);
export type CreateUserDto = z.infer<typeof CreateUserDto>;

export const LoginUserDto = z.object({
    email: z.email("Invalid email address"),
    password: z.string().trim().min(6, "Password must be at least 6 characters"),
});
export type LoginUserDto = z.infer<typeof LoginUserDto>;

export const UpdateUserDto = BaseUserSchema.pick({
    fullName: true,
    phone: true,
}).extend({
    skills: z.array(z.string()).optional(),
}).partial();
export type UpdateUserDto = z.infer<typeof UpdateUserDto>;

export const CreateResumeDto = ResumeSchema.pick({
    fileName: true,
    fileUrl: true,
    fileSize: true,
});
export type CreateResumeDto = z.infer<typeof CreateResumeDto>;
