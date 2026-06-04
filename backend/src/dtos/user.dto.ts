import z from "zod";
import { UserSchema, ResumeSchema } from "../types/user.type";

export const CreateUserDto = UserSchema.pick({
    fullName: true,
    email: true,
    password: true,
    phone: true,
    role: true,
}).extend({
    confirmPassword: z.string().trim().min(6, "Password must be at least 6 characters"),
}).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    }
);
export type CreateUserDto = z.infer<typeof CreateUserDto>;

export const LoginUserDto = z.object({
    email: z.email("Invalid email address"),
    password: z.string().trim().min(6, "Password must be at least 6 characters"),
});
export type LoginUserDto = z.infer<typeof LoginUserDto>;

export const UpdateUserDto = UserSchema.pick({
    fullName: true,
    phone: true,
    skills: true,
}).partial();
export type UpdateUserDto = z.infer<typeof UpdateUserDto>;

export const CreateResumeDto = ResumeSchema.pick({
    fileName: true,
    fileUrl: true,
    fileSize: true,
});
export type CreateResumeDto = z.infer<typeof CreateResumeDto>;