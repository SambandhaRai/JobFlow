import { UpdateUserDto, CreateResumeDto } from "../dtos/user.dto";
import { UserService } from "../services/user.service";
import { UserRoleEnum, UserRoleType } from "../types/user.type";
import { Request, Response } from "express";
import z from "zod";

let userService = new UserService();

export class UserController {

    async getProfile(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const user = await userService.getUserById(userId);
            return res.status(200).json({
                success: true,
                data: user,
                message: "Profile fetched successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async updateProfile(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const parsedData = UpdateUserDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }
            const updatedUser = await userService.updateUser(userId, parsedData.data);
            return res.status(200).json({
                success: true,
                data: updatedUser,
                message: "Profile updated successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async getAllUsers(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const size = parseInt(req.query.size as string) || 20;
            const search = req.query.search as string | undefined;
            const roleParam = req.query.role as string | undefined;

            let role: UserRoleType | undefined;
            if (roleParam) {
                const parsed = UserRoleEnum.safeParse(roleParam);
                if (!parsed.success) {
                    return res.status(400).json({ success: false, message: "Invalid role filter" });
                }
                role = parsed.data;
            }

            const result = await userService.getAllUsers({ page, size, search, role });
            return res.status(200).json({
                success: true,
                data: result.users,
                totalUsers: result.totalUsers,
                message: "Users fetched successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async getUserById(req: Request, res: Response) {
        try {
            const userId = req.params.id as string;
            const user = await userService.getUserById(userId);
            return res.status(200).json({
                success: true,
                data: user,
                message: "User fetched successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async deleteUser(req: Request, res: Response) {
        try {
            const userId = req.params.id as string;
            await userService.deleteUser(userId);
            return res.status(200).json({
                success: true,
                message: "User deleted successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // ---- Resume management ----

    async addResume(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const resumeData = req.file
                ? {
                    fileName: req.file.originalname,
                    fileUrl: req.file.filename,
                    fileSize: req.file.size,
                }
                : req.body;

            const parsedData = CreateResumeDto.safeParse(resumeData);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }
            const updatedUser = await userService.addResume(userId, parsedData.data);
            return res.status(201).json({
                success: true,
                data: updatedUser,
                message: "Resume added successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async removeResume(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const resumeId = req.params.resumeId as string;
            const updatedUser = await userService.removeResume(userId, resumeId);
            return res.status(200).json({
                success: true,
                data: updatedUser,
                message: "Resume removed successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async setDefaultResume(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const resumeId = req.params.resumeId as string;
            const updatedUser = await userService.setDefaultResume(userId, resumeId);
            return res.status(200).json({
                success: true,
                data: updatedUser,
                message: "Default resume updated"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // ---- Saved jobs ----

    async saveJob(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const jobId = req.params.jobId as string;
            const updatedUser = await userService.saveJob(userId, jobId);
            return res.status(200).json({
                success: true,
                data: updatedUser,
                message: "Job saved successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async unsaveJob(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const jobId = req.params.jobId as string;
            const updatedUser = await userService.unsaveJob(userId, jobId);
            return res.status(200).json({
                success: true,
                data: updatedUser,
                message: "Job unsaved successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async getSavedJobs(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const savedJobs = await userService.getSavedJobs(userId);
            return res.status(200).json({
                success: true,
                data: savedJobs,
                message: "Saved jobs fetched successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }
}
