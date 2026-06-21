import z from "zod";
import { ApplicationSchema, ApplicationStatusEnum } from "../types/application.type";

export const CreateApplicationDto = ApplicationSchema.pick({
    jobId: true,
    resumeUrl: true,
    fullName: true,
    email: true,
    phone: true,
    applicationNote: true,
});
export type CreateApplicationDto = z.infer<typeof CreateApplicationDto>;

export const UpdateApplicationStatusDto = z.object({
    status: ApplicationStatusEnum,
});
export type UpdateApplicationStatusDto = z.infer<typeof UpdateApplicationStatusDto>;