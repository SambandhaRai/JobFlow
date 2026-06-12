import mongoose from "mongoose";
import { CompanyModel, ICompany } from "../models/company.model";

type CreateCompanyData = Partial<ICompany> & {
    ownerId: mongoose.Types.ObjectId;
};

export class CompanyRepository {
    async createCompany(data: CreateCompanyData): Promise<ICompany> {
        const company = new CompanyModel(data);
        return await company.save();
    }

    async getCompanyById(id: string): Promise<ICompany | null> {
        return await CompanyModel.findById(id);
    }

    async getCompanyBySlug(slug: string): Promise<ICompany | null> {
        return await CompanyModel.findOne({ slug });
    }

    async getAllCompanies({
        page,
        size,
        search,
    }: { page: number; size: number; search?: string }): Promise<{ companies: ICompany[]; totalCompanies: number }> {
        const filter: Record<string, unknown> = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { industry: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } },
            ];
        }

        const [companies, totalCompanies] = await Promise.all([
            CompanyModel.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * size)
                .limit(size),
            CompanyModel.countDocuments(filter),
        ]);

        return { companies, totalCompanies };
    }

    async getCompaniesForUser(userId: string): Promise<ICompany[]> {
        const objectId = new mongoose.Types.ObjectId(userId);
        return await CompanyModel.find({
            $or: [
                { ownerId: objectId },
                { "members.userId": objectId },
            ],
        }).sort({ createdAt: -1 });
    }

    async updateCompany(id: string, data: Partial<ICompany>): Promise<ICompany | null> {
        return await CompanyModel.findByIdAndUpdate(id, data, { returnDocument: "after" });
    }

    async deleteCompany(id: string): Promise<boolean | null> {
        const result = await CompanyModel.findByIdAndDelete(id);
        return result ? true : null;
    }

    async isCompanyMember(companyId: string, userId: string): Promise<boolean> {
        const company = await CompanyModel.exists({
            _id: new mongoose.Types.ObjectId(companyId),
            $or: [
                { ownerId: new mongoose.Types.ObjectId(userId) },
                { "members.userId": new mongoose.Types.ObjectId(userId) },
            ],
        });
        return Boolean(company);
    }
}
