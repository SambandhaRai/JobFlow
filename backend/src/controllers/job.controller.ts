import { CreateJobDto, UpdateJobDto } from "../dtos/job.dto";
import { JobService } from "../services/job.service";
import {
    JobTypeEnum,
    WorkModeEnum,
    ExperienceLevelEnum,
    JobCategoryEnum,
    HiringTypeEnum,
    JobTypeEnumType,
    WorkModeType,
    ExperienceLevelType,
    JobCategoryType,
    HiringTypeType,
} from "../types/job.type";
import { Request, Response } from "express";
import z from "zod";

let jobService = new JobService();

const getQueryValues = (value: unknown) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.map(String).filter(Boolean);
    if (typeof value === "string") return [value].filter(Boolean);
    return [];
};

const parseEnumValues = <TValue extends string>(
    schema: z.ZodType<TValue>,
    value: unknown,
) => {
    const values = getQueryValues(value);
    if (values.length === 0) return undefined;

    const parsedValues: TValue[] = [];
    for (const item of values) {
        const parsed = schema.safeParse(item);
        if (!parsed.success) return null;
        parsedValues.push(parsed.data);
    }

    return Array.from(new Set(parsedValues));
};

export class JobController {

    async createJob(req: Request, res: Response) {
        try {
            const posterId = req.user?.id;
            if (!posterId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const parsedData = CreateJobDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }
            const newJob = await jobService.createJob(parsedData.data, posterId);
            return res.status(201).json({
                success: true,
                data: newJob,
                message: "Job created successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async getAllJobs(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const size = parseInt(req.query.size as string) || 20;
            const search = req.query.search as string | undefined;
            const location = getQueryValues(req.query.location);
            const postedByUserId = (req.query.postedByUserId || req.query.employerId) as string | undefined;
            const companyId = req.query.companyId as string | undefined;
            const minSalary = req.query.minSalary ? Number(req.query.minSalary) : undefined;
            const maxSalary = req.query.maxSalary ? Number(req.query.maxSalary) : undefined;

            if (minSalary !== undefined && Number.isNaN(minSalary)) {
                return res.status(400).json({ success: false, message: "Invalid minSalary filter" });
            }

            if (maxSalary !== undefined && Number.isNaN(maxSalary)) {
                return res.status(400).json({ success: false, message: "Invalid maxSalary filter" });
            }

            // Validate enum filters
            let jobType: JobTypeEnumType[] | undefined;
            if (req.query.jobType) {
                const parsed = parseEnumValues(JobTypeEnum, req.query.jobType);
                if (parsed === null) {
                    return res.status(400).json({ success: false, message: "Invalid jobType filter" });
                }
                jobType = parsed;
            }

            let workMode: WorkModeType[] | undefined;
            if (req.query.workMode) {
                const parsed = parseEnumValues(WorkModeEnum, req.query.workMode);
                if (parsed === null) {
                    return res.status(400).json({ success: false, message: "Invalid workMode filter" });
                }
                workMode = parsed;
            }

            let experienceLevel: ExperienceLevelType[] | undefined;
            if (req.query.experienceLevel) {
                const parsed = parseEnumValues(ExperienceLevelEnum, req.query.experienceLevel);
                if (parsed === null) {
                    return res.status(400).json({ success: false, message: "Invalid experienceLevel filter" });
                }
                experienceLevel = parsed;
            }

            let category: JobCategoryType[] | undefined;
            if (req.query.category) {
                const parsed = parseEnumValues(JobCategoryEnum, req.query.category);
                if (parsed === null) {
                    return res.status(400).json({ success: false, message: "Invalid category filter" });
                }
                category = parsed;
            }

            let hiringType: HiringTypeType | undefined;
            if (req.query.hiringType) {
                const parsed = HiringTypeEnum.safeParse(req.query.hiringType);
                if (!parsed.success) {
                    return res.status(400).json({ success: false, message: "Invalid hiringType filter" });
                }
                hiringType = parsed.data;
            }

            // Parse boolean filters (URL params always come in as strings)
            const isBeginnerFriendly =
                req.query.isBeginnerFriendly === "true" ? true
                    : req.query.isBeginnerFriendly === "false" ? false
                        : undefined;
            const isVerified =
                req.query.isVerified === "true" ? true
                    : req.query.isVerified === "false" ? false
                        : undefined;

            const result = await jobService.getAllJobs({
                page,
                size,
                search,
                jobType,
                workMode,
                experienceLevel,
                category,
                location: location.length > 0 ? location : undefined,
                minSalary,
                maxSalary,
                isBeginnerFriendly,
                isVerified,
                postedByUserId,
                companyId,
                hiringType,
            });

            return res.status(200).json({
                success: true,
                data: result.jobs,
                totalJobs: result.totalJobs,
                message: "Jobs fetched successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async getJobById(req: Request, res: Response) {
        try {
            const jobId = req.params.id as string;
            const job = await jobService.getJobById(jobId);
            return res.status(200).json({
                success: true,
                data: job,
                message: "Job fetched successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async updateJob(req: Request, res: Response) {
        try {
            const requesterId = req.user?.id;
            const requesterRole = req.user?.role;
            if (!requesterId || !requesterRole) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const jobId = req.params.id as string;
            const parsedData = UpdateJobDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }
            const updatedJob = await jobService.updateJob(
                jobId,
                parsedData.data,
                requesterId,
                requesterRole
            );
            return res.status(200).json({
                success: true,
                data: updatedJob,
                message: "Job updated successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async deleteJob(req: Request, res: Response) {
        try {
            const requesterId = req.user?.id;
            const requesterRole = req.user?.role;
            if (!requesterId || !requesterRole) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const jobId = req.params.id as string;
            await jobService.deleteJob(jobId, requesterId, requesterRole);
            return res.status(200).json({
                success: true,
                message: "Job deleted successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async verifyJob(req: Request, res: Response) {
        try {
            const jobId = req.params.id as string;
            const updatedJob = await jobService.verifyJob(jobId);
            return res.status(200).json({
                success: true,
                data: updatedJob,
                message: "Job verified successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }
}
