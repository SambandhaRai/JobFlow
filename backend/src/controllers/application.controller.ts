import { CreateApplicationDto, UpdateApplicationStatusDto } from "../dtos/application.dto";
import { ApplicationService } from "../services/application.service";
import { ApplicationStatusEnum, ApplicationStatusType } from "../types/application.type";
import { Request, Response } from "express";
import z from "zod";

let applicationService = new ApplicationService();

export class ApplicationController {

    async applyToJob(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const parsedData = CreateApplicationDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }
            const newApplication = await applicationService.applyToJob(parsedData.data, userId);
            return res.status(201).json({
                success: true,
                data: newApplication,
                message: "Application submitted successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async getMyApplications(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const page = parseInt(req.query.page as string) || 1;
            const size = parseInt(req.query.size as string) || 50;

            let status: ApplicationStatusType | undefined;
            if (req.query.status) {
                const parsed = ApplicationStatusEnum.safeParse(req.query.status);
                if (!parsed.success) {
                    return res.status(400).json({ success: false, message: "Invalid status filter" });
                }
                status = parsed.data;
            }

            const result = await applicationService.getMyApplications(userId, { page, size, status });
            return res.status(200).json({
                success: true,
                data: result.applications,
                totalApplications: result.totalApplications,
                message: "Applications fetched successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async getApplicationsForJob(req: Request, res: Response) {
        try {
            const requesterId = req.user?.id;
            const requesterRole = req.user?.role;
            if (!requesterId || !requesterRole) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const jobId = req.params.jobId as string;
            const page = parseInt(req.query.page as string) || 1;
            const size = parseInt(req.query.size as string) || 20;

            let status: ApplicationStatusType | undefined;
            if (req.query.status) {
                const parsed = ApplicationStatusEnum.safeParse(req.query.status);
                if (!parsed.success) {
                    return res.status(400).json({ success: false, message: "Invalid status filter" });
                }
                status = parsed.data;
            }

            const result = await applicationService.getApplicationsForJob(
                jobId,
                requesterId,
                requesterRole,
                { page, size, status }
            );
            return res.status(200).json({
                success: true,
                data: result.applications,
                totalApplications: result.totalApplications,
                message: "Applications fetched successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async getEmployerApplications(req: Request, res: Response) {
        try {
            const employerId = req.user?.id;
            if (!employerId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const page = parseInt(req.query.page as string) || 1;
            const size = parseInt(req.query.size as string) || 20;

            let status: ApplicationStatusType | undefined;
            if (req.query.status) {
                const parsed = ApplicationStatusEnum.safeParse(req.query.status);
                if (!parsed.success) {
                    return res.status(400).json({ success: false, message: "Invalid status filter" });
                }
                status = parsed.data;
            }

            const result = await applicationService.getEmployerApplications(employerId, { page, size, status });
            return res.status(200).json({
                success: true,
                data: result.applications,
                totalApplications: result.totalApplications,
                message: "Applications fetched successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async getAllApplications(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const size = parseInt(req.query.size as string) || 20;

            let status: ApplicationStatusType | undefined;
            if (req.query.status) {
                const parsed = ApplicationStatusEnum.safeParse(req.query.status);
                if (!parsed.success) {
                    return res.status(400).json({ success: false, message: "Invalid status filter" });
                }
                status = parsed.data;
            }

            const result = await applicationService.getAllApplications({ page, size, status });
            return res.status(200).json({
                success: true,
                data: result.applications,
                totalApplications: result.totalApplications,
                message: "Applications fetched successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async getApplicationById(req: Request, res: Response) {
        try {
            const requesterId = req.user?.id;
            const requesterRole = req.user?.role;
            if (!requesterId || !requesterRole) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const applicationId = req.params.id as string;
            const application = await applicationService.getApplicationById(
                applicationId,
                requesterId,
                requesterRole
            );
            return res.status(200).json({
                success: true,
                data: application,
                message: "Application fetched successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async updateApplicationStatus(req: Request, res: Response) {
        try {
            const requesterId = req.user?.id;
            const requesterRole = req.user?.role;
            if (!requesterId || !requesterRole) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const applicationId = req.params.id as string;
            const parsedData = UpdateApplicationStatusDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }
            const updatedApplication = await applicationService.updateApplicationStatus(
                applicationId,
                parsedData.data,
                requesterId,
                requesterRole
            );
            return res.status(200).json({
                success: true,
                data: updatedApplication,
                message: "Application status updated successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async withdrawApplication(req: Request, res: Response) {
        try {
            const requesterId = req.user?.id;
            const requesterRole = req.user?.role;
            if (!requesterId || !requesterRole) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const applicationId = req.params.id as string;
            await applicationService.withdrawApplication(applicationId, requesterId, requesterRole);
            return res.status(200).json({
                success: true,
                message: "Application withdrawn successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }
}