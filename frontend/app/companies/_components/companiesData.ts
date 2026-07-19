import { resolveAvatarUrl } from "../../../lib/avatar";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5051";

export const COMPANIES_PER_PAGE = 24;

export type SearchParams = Record<string, string | string[] | undefined>;

type ApiResponse<TData> = {
    success?: boolean;
    data?: TData;
    totalCompanies?: number;
    message?: string;
};

type BackendPublicCompany = {
    _id?: string;
    id?: string;
    name?: string;
    slug?: string;
    website?: string;
    logoUrl?: string;
    description?: string;
    industry?: string;
    location?: string;
    isVerified?: boolean;
    createdAt?: string;
    openJobs?: number;
};

export type PublicCompany = {
    id: string;
    name: string;
    website?: string;
    websiteLabel?: string;
    logoUrl?: string;
    description?: string;
    industry?: string;
    location?: string;
    isVerified: boolean;
    openJobs: number;
};

export type CompanyFacets = {
    industries: string[];
    locations: string[];
};

export type CompaniesData = {
    companies: PublicCompany[];
    totalCompanies: number;
    facets: CompanyFacets;
    error: string | null;
};

const stripWebsiteScheme = (website?: string) => (
    website?.replace(/^https?:\/\//i, "").replace(/\/$/, "") || undefined
);

const ensureWebsiteHref = (website?: string) => {
    if (!website) return undefined;
    return /^https?:\/\//i.test(website) ? website : `https://${website}`;
};

const truncate = (value: string, max: number) => (
    value.length <= max ? value : `${value.slice(0, max).trimEnd()}…`
);

const mapCompany = (company: BackendPublicCompany): PublicCompany => {
    const description = company.description?.replace(/\s+/g, " ").trim();

    return {
        id: company._id ?? company.id ?? "",
        name: company.name?.trim() || "Company",
        website: ensureWebsiteHref(company.website),
        websiteLabel: stripWebsiteScheme(company.website),
        logoUrl: resolveAvatarUrl(company.logoUrl) ?? undefined,
        description: description ? truncate(description, 160) : undefined,
        industry: company.industry?.trim() || undefined,
        location: company.location?.trim() || undefined,
        isVerified: Boolean(company.isVerified),
        openJobs: company.openJobs ?? 0,
    };
};

const fetchJson = async <TData>(path: string) => {
    const response = await fetch(`${API_BASE_URL}${path}`, { cache: "no-store" });

    if (!response.ok) {
        let message = `Request failed with ${response.status}`;
        try {
            const body = await response.json() as ApiResponse<TData>;
            message = body.message || message;
        } catch {}
        throw new Error(message);
    }

    return response.json() as Promise<ApiResponse<TData>>;
};

export const getFirstParam = (value: string | string[] | undefined) => (
    (Array.isArray(value) ? value[0] : value)?.trim() || undefined
);

export const parsePageParam = (value: string | string[] | undefined) => {
    const parsed = Number.parseInt(getFirstParam(value) ?? "", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

export const fetchCompaniesData = async (searchParams: SearchParams): Promise<CompaniesData> => {
    const page = parsePageParam(searchParams.page);
    const query = new URLSearchParams({
        page: String(page),
        size: String(COMPANIES_PER_PAGE),
    });

    const search = getFirstParam(searchParams.q);
    const industry = getFirstParam(searchParams.industry);
    const location = getFirstParam(searchParams.location);

    if (search) query.set("search", search);
    if (industry) query.set("industry", industry);
    if (location) query.set("location", location);

    // Facets are cosmetic, so a failure there must not blank out the listing.
    const [listResult, facetsResult] = await Promise.allSettled([
        fetchJson<BackendPublicCompany[]>(`/api/companies/public?${query.toString()}`),
        fetchJson<CompanyFacets>("/api/companies/public/facets"),
    ]);

    const facets = facetsResult.status === "fulfilled"
        ? {
            industries: facetsResult.value.data?.industries ?? [],
            locations: facetsResult.value.data?.locations ?? [],
        }
        : { industries: [], locations: [] };

    if (listResult.status === "rejected") {
        const message = listResult.reason instanceof Error
            ? listResult.reason.message
            : "The backend did not return companies.";
        return { companies: [], totalCompanies: 0, facets, error: message };
    }

    return {
        companies: (listResult.value.data ?? []).map(mapCompany),
        totalCompanies: listResult.value.totalCompanies ?? 0,
        facets,
        error: null,
    };
};

/** Builds a href that keeps existing filters and overrides only what changed. */
export const createCompaniesHref = (
    searchParams: SearchParams,
    overrides: Record<string, string | number | undefined>,
) => {
    const params = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, value]) => {
        const first = getFirstParam(value);
        if (first) params.set(key, first);
    });

    Object.entries(overrides).forEach(([key, value]) => {
        if (value === undefined || value === "") params.delete(key);
        else params.set(key, String(value));
    });

    // Any filter change invalidates the current page offset.
    if (!("page" in overrides)) params.delete("page");
    if (params.get("page") === "1") params.delete("page");

    const queryString = params.toString();
    return queryString ? `/companies?${queryString}` : "/companies";
};
