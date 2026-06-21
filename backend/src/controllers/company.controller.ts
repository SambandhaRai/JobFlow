import { Request, Response } from "express";
import z from "zod";
import { CreateCompanyDto, UpdateCompanyDto } from "../dtos/company.dto";
import { CompanyService } from "../services/company.service";

const companyService = new CompanyService();

export class CompanyController {
    async createCompany(req: Request, res: Response) {
        try {
            const requesterId = req.user?.id;
            if (!requesterId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const parsedData = CreateCompanyDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error),
                });
            }

            const company = await companyService.createCompany(parsedData.data, requesterId);
            return res.status(201).json({
                success: true,
                data: company,
                message: "Company created successfully",
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }

    async getMyCompanies(req: Request, res: Response) {
        try {
            const requesterId = req.user?.id;
            if (!requesterId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const companies = await companyService.getMyCompanies(requesterId);
            return res.status(200).json({
                success: true,
                data: companies,
                message: "Companies fetched successfully",
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }

    async getAllCompanies(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const size = parseInt(req.query.size as string) || 50;
            const search = req.query.search as string | undefined;

            const result = await companyService.getAllCompanies({ page, size, search });
            return res.status(200).json({
                success: true,
                data: result.companies,
                totalCompanies: result.totalCompanies,
                message: "Companies fetched successfully",
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }

    async getCompanyById(req: Request, res: Response) {
        try {
            const company = await companyService.getCompanyById(req.params.id as string);
            return res.status(200).json({
                success: true,
                data: company,
                message: "Company fetched successfully",
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }

    async updateCompany(req: Request, res: Response) {
        try {
            const requesterId = req.user?.id;
            if (!requesterId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const parsedData = UpdateCompanyDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error),
                });
            }

            const company = await companyService.updateCompany(req.params.id as string, parsedData.data, requesterId);
            return res.status(200).json({
                success: true,
                data: company,
                message: "Company updated successfully",
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }

    async verifyCompany(req: Request, res: Response) {
        try {
            const company = await companyService.verifyCompany(req.params.id as string);
            return res.status(200).json({
                success: true,
                data: company,
                message: "Company verified successfully",
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }

    async deleteCompany(req: Request, res: Response) {
        try {
            await companyService.deleteCompany(req.params.id as string);
            return res.status(200).json({
                success: true,
                message: "Company deleted successfully",
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
}
