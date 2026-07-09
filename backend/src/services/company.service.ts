import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { CreateCompanyDto, UpdateCompanyDto } from "../dtos/company.dto";
import { HttpError } from "../errors/http-error";
import { CompanyRepository } from "../repositories/company.repository";
import { uploadDir } from "../middlewares/upload.middleware";

const companyRepository = new CompanyRepository();

const createSlug = (name: string) => (
    name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
);

export class CompanyService {
    async createCompany(data: CreateCompanyDto, ownerId: string) {
        if (!mongoose.Types.ObjectId.isValid(ownerId)) {
            throw new HttpError(400, "Invalid owner ID");
        }

        const baseSlug = createSlug(data.name);
        let slug = baseSlug;
        let suffix = 1;

        while (await companyRepository.getCompanyBySlug(slug)) {
            suffix += 1;
            slug = `${baseSlug}-${suffix}`;
        }

        return await companyRepository.createCompany({
            ...data,
            slug,
            ownerId: new mongoose.Types.ObjectId(ownerId),
            members: [{
                userId: new mongoose.Types.ObjectId(ownerId),
                role: "owner",
            }],
        });
    }

    async getMyCompanies(userId: string) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new HttpError(400, "Invalid user ID");
        }

        return await companyRepository.getCompaniesForUser(userId);
    }

    async getAllCompanies(params: { page?: number; size?: number; search?: string }) {
        const page = params.page ?? 1;
        const size = params.size ?? 50;
        return await companyRepository.getAllCompanies({ page, size, search: params.search });
    }

    async getCompanyById(companyId: string) {
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            throw new HttpError(400, "Invalid company ID");
        }

        const company = await companyRepository.getCompanyById(companyId);
        if (!company) {
            throw new HttpError(404, "Company not found");
        }

        return company;
    }

    async updateCompany(companyId: string, data: UpdateCompanyDto, requesterId: string) {
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            throw new HttpError(400, "Invalid company ID");
        }

        const isMember = await companyRepository.isCompanyMember(companyId, requesterId);
        if (!isMember) {
            throw new HttpError(403, "Not authorized to update this company");
        }

        return await companyRepository.updateCompany(companyId, data);
    }

    async uploadCompanyLogo(companyId: string, requesterId: string, file?: Express.Multer.File) {
        if (!file) {
            throw new HttpError(400, "Please upload a file");
        }
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            throw new HttpError(400, "Invalid company ID");
        }

        const isMember = await companyRepository.isCompanyMember(companyId, requesterId);
        if (!isMember) {
            throw new HttpError(403, "Not authorized to update this company");
        }

        const company = await companyRepository.getCompanyById(companyId);
        if (!company) {
            throw new HttpError(404, "Company not found");
        }

        const oldLogo = company.logoUrl;
        if (oldLogo && !/^https?:\/\//i.test(oldLogo)) {
            const oldFilePath = path.join(uploadDir, oldLogo);
            if (fs.existsSync(oldFilePath)) {
                await fs.promises.unlink(oldFilePath);
            }
        }

        const updated = await companyRepository.updateCompany(companyId, { logoUrl: file.filename });
        if (!updated) {
            throw new HttpError(404, "Company not found");
        }

        return updated;
    }

    async verifyCompany(companyId: string) {
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            throw new HttpError(400, "Invalid company ID");
        }

        const company = await companyRepository.getCompanyById(companyId);
        if (!company) {
            throw new HttpError(404, "Company not found");
        }

        return await companyRepository.updateCompany(companyId, { isVerified: true });
    }

    async deleteCompany(companyId: string) {
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            throw new HttpError(400, "Invalid company ID");
        }

        const company = await companyRepository.getCompanyById(companyId);
        if (!company) {
            throw new HttpError(404, "Company not found");
        }

        return await companyRepository.deleteCompany(companyId);
    }

    async isCompanyMember(companyId: string, userId: string) {
        if (!mongoose.Types.ObjectId.isValid(companyId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return false;
        }

        return await companyRepository.isCompanyMember(companyId, userId);
    }
}
