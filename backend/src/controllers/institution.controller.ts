import { Request, Response } from "express";
import { InstitutionService } from "../services/institution.service";
import { InstitutionType } from "../models/institution.model";

const institutionService = new InstitutionService();

export class InstitutionController {
    async getInstitutions(req: Request, res: Response) {
        try {
            const search = req.query.search as string | undefined;
            const typeParam = req.query.type as string | undefined;
            const limit = parseInt(req.query.limit as string) || 50;

            if (
                typeParam !== undefined &&
                typeParam !== "school" &&
                typeParam !== "college" &&
                typeParam !== "university"
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid institution type",
                });
            }

            const institutions = await institutionService.getInstitutions({
                search,
                type: typeParam as InstitutionType | undefined,
                limit,
            });

            return res.status(200).json({
                success: true,
                data: institutions,
                message: "Institutions fetched successfully",
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
}
