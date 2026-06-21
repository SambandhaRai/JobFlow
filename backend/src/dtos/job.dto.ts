import z from "zod";
import { JobBaseSchema, validateJobHiringDetails } from "../types/job.type";

const JobMutationDto = JobBaseSchema.pick({
    title: true,
    hiringType: true,
    companyId: true,
    hiringName: true,
    hiringEmail: true,
    hiringPhone: true,
    hiringWebsite: true,
    hiringLocation: true,
    location: true,
    jobType: true,
    workMode: true,
    experienceLevel: true,
    category: true,
    salary: true,
    duration: true,
    skills: true,
    description: true,
    responsibilities: true,
    requirements: true,
    isBeginnerFriendly: true,
    deadline: true,
});

export const CreateJobDto = JobMutationDto.superRefine(validateJobHiringDetails);
export type CreateJobDto = z.infer<typeof CreateJobDto>;

export const UpdateJobDto = JobMutationDto.partial();
export type UpdateJobDto = z.infer<typeof UpdateJobDto>;
