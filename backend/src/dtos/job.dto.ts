import z from "zod";
import { JobSchema } from "../types/job.type";

export const CreateJobDto = JobSchema.pick({
    title: true,
    company: true,
    employerId: true,
    location: true,
    jobType: true,
    workMode: true,
    experienceLevel: true,
    salary: true,
    duration: true,
    skills: true,
    description: true,
    responsibilities: true,
    requirements: true,
    isBeginnerFriendly: true,
    deadline: true,
});
export type CreateJobDto = z.infer<typeof CreateJobDto>;

export const UpdateJobDto = CreateJobDto.omit({ employerId: true }).partial();
export type UpdateJobDto = z.infer<typeof UpdateJobDto>;