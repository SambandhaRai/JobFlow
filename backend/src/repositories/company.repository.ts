import mongoose from "mongoose";
import { CompanyModel, ICompany } from "../models/company.model";
import { JobModel } from "../models/job.model";

type CreateCompanyData = Partial<ICompany> & {
    ownerId: mongoose.Types.ObjectId;
};

/**
 * Fields safe to expose on the unauthenticated companies directory.
 * Deliberately omits contacts, email, phone, ownerId and members so the
 * public listing never leaks recruiter contact details.
 */
export type PublicCompany = {
    _id: mongoose.Types.ObjectId;
    name: string;
    slug: string;
    website?: string;
    logoUrl?: string;
    description?: string;
    industry?: string;
    location?: string;
    isVerified: boolean;
    createdAt: Date;
    openJobs: number;
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

    /**
     * Directory listing for the public /companies page. Projects only the
     * public-safe fields and decorates each company with its open job count.
     */
    async getPublicCompanies({
        page,
        size,
        search,
        industry,
        location,
    }: {
        page: number;
        size: number;
        search?: string;
        industry?: string;
        location?: string;
    }): Promise<{ companies: PublicCompany[]; totalCompanies: number }> {
        const filter: Record<string, unknown> = {};

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { industry: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } },
            ];
        }
        if (industry) filter.industry = { $regex: `^${industry}$`, $options: "i" };
        if (location) filter.location = { $regex: location, $options: "i" };

        const [companies, totalCompanies] = await Promise.all([
            CompanyModel.find(filter)
                .select("name slug website logoUrl description industry location isVerified createdAt")
                .sort({ isVerified: -1, createdAt: -1 })
                .skip((page - 1) * size)
                .limit(size)
                .lean(),
            CompanyModel.countDocuments(filter),
        ]);

        const counts = await JobModel.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
            {
                $match: {
                    companyId: { $in: companies.map((company) => company._id) },
                    $or: [
                        { deadline: { $exists: false } },
                        { deadline: null },
                        { deadline: { $gte: new Date() } },
                    ],
                },
            },
            { $group: { _id: "$companyId", count: { $sum: 1 } } },
        ]);

        const countByCompany = new Map(counts.map((entry) => [String(entry._id), entry.count]));

        return {
            companies: companies.map((company) => ({
                ...company,
                openJobs: countByCompany.get(String(company._id)) ?? 0,
            })) as PublicCompany[],
            totalCompanies,
        };
    }

    /** Distinct industries/locations that actually have companies, for filter dropdowns. */
    async getPublicCompanyFacets(): Promise<{ industries: string[]; locations: string[] }> {
        const [industries, locations] = await Promise.all([
            CompanyModel.distinct("industry", { industry: { $nin: [null, ""] } }),
            CompanyModel.distinct("location", { location: { $nin: [null, ""] } }),
        ]);

        return {
            industries: (industries as string[]).filter(Boolean).sort(),
            locations: (locations as string[]).filter(Boolean).sort(),
        };
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
