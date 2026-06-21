import type { JobDetailsUser } from "../../../jobs/[id]/_components/jobDetailsData";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

type ApiResponse<TData> = {
    success?: boolean;
    data?: TData;
    totalJobs?: number;
    message?: string;
};

type HttpError = Error & { status?: number };

type BackendCompanyContact = {
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
};

type BackendCompany = {
    _id?: string;
    id?: string;
    name?: string;
    slug?: string;
    website?: string;
    logoUrl?: string;
    description?: string;
    industry?: string;
    location?: string;
    email?: string;
    phone?: string;
    contacts?: BackendCompanyContact[];
    isVerified?: boolean;
    createdAt?: string;
};

type BackendCompanyJob = {
    _id?: string;
    id?: string;
    title?: string;
    location?: string;
    workMode?: string;
    jobType?: string;
    category?: string;
    isVerified?: boolean;
    isBeginnerFriendly?: boolean;
    postedAt?: string;
    createdAt?: string;
};

export type CompanyContact = {
    name: string;
    role?: string;
    email?: string;
    phone?: string;
};

export type CompanyDetails = {
    id: string;
    name: string;
    website?: string;
    websiteLabel?: string;
    logoUrl?: string;
    description?: string;
    industry?: string;
    location?: string;
    email?: string;
    phone?: string;
    contacts: CompanyContact[];
    isVerified: boolean;
    memberSince?: string;
};

export type CompanyJob = {
    id: string;
    title: string;
    location: string;
    workModeLabel: string;
    jobTypeLabel: string;
    category?: string;
    isVerified: boolean;
    isBeginnerFriendly: boolean;
    postedAt: string;
};

export type CompanyDetailsData = {
    company: CompanyDetails;
    jobs: CompanyJob[];
    totalJobs: number;
    user: JobDetailsUser | null;
};

const titleCase = (value: string) => (
    value
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
);

const formatMonthYear = (dateValue?: string) => {
    if (!dateValue) return undefined;

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return undefined;

    return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(date);
};

const formatPostedAt = (dateValue?: string) => {
    if (!dateValue) return "Recently posted";

    const postedAt = new Date(dateValue);
    if (Number.isNaN(postedAt.getTime())) return "Recently posted";

    const diffMs = Date.now() - postedAt.getTime();
    const diffHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));

    if (diffHours < 1) return "Posted just now";
    if (diffHours < 24) return `Posted ${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `Posted ${diffDays}d ago`;

    const diffWeeks = Math.floor(diffDays / 7);
    return `Posted ${diffWeeks}w ago`;
};

const stripWebsiteScheme = (website?: string) => {
    if (!website) return undefined;
    return website.replace(/^https?:\/\//i, "").replace(/\/$/, "");
};

const ensureWebsiteHref = (website?: string) => {
    if (!website) return undefined;
    return /^https?:\/\//i.test(website) ? website : `https://${website}`;
};

const getHeaders = (token: string | null) => (
    token ? { Authorization: `Bearer ${token}` } : undefined
);

const fetchJson = async <TData>(path: string, token: string | null) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: getHeaders(token),
        cache: "no-store",
    });

    if (!response.ok) {
        let message = `Request failed with ${response.status}`;
        try {
            const body = await response.json() as ApiResponse<TData>;
            message = body.message || message;
        } catch {
            // Keep the status-based message when the API does not return JSON.
        }

        const error = new Error(message) as HttpError;
        error.status = response.status;
        throw error;
    }

    return response.json() as Promise<ApiResponse<TData>>;
};

const mapContact = (contact: BackendCompanyContact): CompanyContact | null => {
    const name = contact.name?.trim();
    if (!name) return null;

    return {
        name,
        role: contact.role?.trim() || undefined,
        email: contact.email?.trim() || undefined,
        phone: contact.phone?.trim() || undefined,
    };
};

const mapCompany = (company: BackendCompany): CompanyDetails => ({
    id: company._id ?? company.id ?? "",
    name: company.name ?? "Company",
    website: ensureWebsiteHref(company.website),
    websiteLabel: stripWebsiteScheme(company.website),
    logoUrl: company.logoUrl || undefined,
    description: company.description?.trim() || undefined,
    industry: company.industry?.trim() || undefined,
    location: company.location?.trim() || undefined,
    email: company.email?.trim() || undefined,
    phone: company.phone?.trim() || undefined,
    contacts: (company.contacts ?? [])
        .map(mapContact)
        .filter((contact): contact is CompanyContact => contact !== null),
    isVerified: Boolean(company.isVerified),
    memberSince: formatMonthYear(company.createdAt),
});

const mapCompanyJob = (job: BackendCompanyJob): CompanyJob => ({
    id: job._id ?? job.id ?? "",
    title: job.title ?? "Untitled role",
    location: job.location ?? "Location not listed",
    workModeLabel: titleCase(job.workMode ?? "hybrid"),
    jobTypeLabel: titleCase(job.jobType ?? "internship"),
    category: job.category,
    isVerified: Boolean(job.isVerified),
    isBeginnerFriendly: Boolean(job.isBeginnerFriendly),
    postedAt: formatPostedAt(job.postedAt ?? job.createdAt),
});

export const fetchCompanyDetailsData = async (
    companyId: string,
    token: string | null,
): Promise<CompanyDetailsData> => {
    const companyResponse = await fetchJson<BackendCompany>(`/api/companies/${companyId}`, token);
    const backendCompany = companyResponse.data;

    if (!backendCompany) {
        const error = new Error("Company not found") as HttpError;
        error.status = 404;
        throw error;
    }

    const company = mapCompany(backendCompany);

    let jobs: CompanyJob[] = [];
    let totalJobs = 0;
    try {
        const jobsResponse = await fetchJson<BackendCompanyJob[]>(
            `/api/jobs?companyId=${companyId}&size=50`,
            token,
        );
        jobs = (jobsResponse.data ?? []).map(mapCompanyJob);
        totalJobs = jobsResponse.totalJobs ?? jobs.length;
    } catch {
        jobs = [];
        totalJobs = 0;
    }

    let user: JobDetailsUser | null = null;
    if (token) {
        try {
            const userResponse = await fetchJson<JobDetailsUser>("/api/users/me", token);
            user = userResponse.data ?? null;
        } catch {
            user = null;
        }
    }

    return { company, jobs, totalJobs, user };
};

export const isNotFoundError = (error: unknown) => (
    Boolean(error && typeof error === "object" && (error as HttpError).status === 404)
);
