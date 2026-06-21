import { InstitutionModel, InstitutionType } from "../models/institution.model";

const DEFAULT_INSTITUTIONS: Array<{ name: string; type: InstitutionType }> = [
    { name: "St. Xavier's School Jawalakhel", type: "school" },
    { name: "Budhanilkantha School", type: "school" },
    { name: "Rato Bangala School", type: "school" },
    { name: "Little Angels' School", type: "school" },
    { name: "GEMS School", type: "school" },
    { name: "Galaxy Public School", type: "school" },
    { name: "Kathmandu University", type: "university" },
    { name: "Tribhuvan University", type: "university" },
    { name: "Pokhara University", type: "university" },
    { name: "Purbanchal University", type: "university" },
    { name: "Mid-West University", type: "university" },
    { name: "Far-Western University", type: "university" },
    { name: "Kathmandu Engineering College", type: "college" },
    { name: "Kantipur Engineering College", type: "college" },
    { name: "Nepal College of Information Technology", type: "college" },
    { name: "Islington College", type: "college" },
    { name: "Herald College Kathmandu", type: "college" },
    { name: "British College", type: "college" },
];

export class InstitutionService {
    private async seedDefaultsIfEmpty() {
        const count = await InstitutionModel.estimatedDocumentCount();
        if (count > 0) return;

        await InstitutionModel.insertMany(DEFAULT_INSTITUTIONS, { ordered: false });
    }

    async getInstitutions({
        search,
        type,
        limit = 50,
    }: {
        search?: string;
        type?: InstitutionType;
        limit?: number;
    }) {
        await this.seedDefaultsIfEmpty();

        const filter: Record<string, unknown> = { isActive: true };
        if (type) filter.type = type;
        if (search) {
            filter.name = { $regex: search, $options: "i" };
        }

        return await InstitutionModel.find(filter)
            .sort({ name: 1 })
            .limit(limit);
    }
}
