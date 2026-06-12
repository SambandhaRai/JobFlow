import mongoose from "mongoose";
import { CreateCompanyDto, UpdateCompanyDto } from "../dtos/company.dto";
import { HttpError } from "../errors/http-error";
import { CompanyRepository } from "../repositories/company.repository";

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
