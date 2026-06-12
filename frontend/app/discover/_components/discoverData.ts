import type { ExperienceLevel, HiringType, JobCategory, JobListQuery, JobType, WorkMode } from "../../../lib/api/endpoints";

export type SearchParams = Record<string, string | string[] | undefined>;
export const JOBS_PER_DISCOVER_PAGE = 7;

export type UserRole = "user" | "employer" | "admin";

export type DiscoverUser = {
    _id?: string;
    id?: string;
    fullName?: string;
    email?: string;
    role?: UserRole;
    skills?: string[];
    educations?: unknown[];
    resumes?: unknown[];
    savedJobs?: unknown[];
};

export type BackendJob = {
    _id?: string;
    id?: string;
    title?: string;
    company?: string;
    hiringType?: HiringType;
    hiringName?: string;
    hiringEmail?: string;
    hiringPhone?: string;
    hiringWebsite?: string;
    hiringLocation?: string;
    isHiringVerified?: boolean;
    location?: string;
    jobType?: JobType;
    workMode?: WorkMode;
    experienceLevel?: ExperienceLevel;
    category?: JobCategory;
    salary?: {
        min?: number;
        max?: number;
        currency?: string;
    };
    duration?: string;
    skills?: string[];
    description?: string;
    responsibilities?: string[];
    requirements?: string[];
    isVerified?: boolean;
    isBeginnerFriendly?: boolean;
    postedAt?: string;
    createdAt?: string;
};

export type Job = {
    id: string;
    title: string;
    company: string;
    hiringType: HiringType;
    isHiringVerified: boolean;
    category: string;
    location: string;
    workMode: string;
    type: string;
    compensation: string;
    postedAt: string;
    duration?: string;
    skills: string[];
    description?: string;
    responsibilities: string[];
    requirements: string[];
    highlightedSkill?: string;
    isVerified: boolean;
    isBeginnerFriendly: boolean;
};

export type SavedJob = {
    id: string;
    title: string;
    company: string;
};

export type TrendingSearch = {
    label: string;
    change: string;
};

export type ActiveFilter = {
    key: string;
    paramKey?: string;
    value?: string;
    keys?: string[];
    label: string;
};

type ApiListResponse<TData> = {
    success?: boolean;
    data?: TData;
    totalJobs?: number;
    message?: string;
};

type DiscoverFetchOptions = {
    token: string | null;
    searchParams: SearchParams;
};

export type DiscoverData = {
    jobs: Job[];
    totalJobs: number;
    savedJobs: SavedJob[];
    user: DiscoverUser | null;
    error: string | null;
};

export type FilterOption<TValue extends string> = {
    label: string;
    value: TValue;
};

export const jobTypeOptions: Array<FilterOption<JobType>> = [
    { label: "Internship", value: "internship" },
    { label: "Full-time", value: "full-time" },
    { label: "Part-time", value: "part-time" },
];

export const experienceOptions: Array<FilterOption<ExperienceLevel>> = [
    { label: "No experience", value: "no-experience" },
    { label: "Entry-level (0-1 yr)", value: "entry-level" },
    { label: "Junior (1-2 yrs)", value: "junior" },
    { label: "Mid-level (2+ yrs)", value: "mid-level" },
];

export const workModeOptions: Array<FilterOption<WorkMode>> = [
    { label: "Remote", value: "remote" },
    { label: "Hybrid", value: "hybrid" },
    { label: "On-site", value: "on-site" },
];

export const salaryOptions = [
    { label: "Up to Rs 25,000", minSalary: undefined, maxSalary: 25000 },
    { label: "Rs 25,000-50,000", minSalary: 25000, maxSalary: 50000 },
    { label: "Rs 50,000+", minSalary: 50000, maxSalary: undefined },
];

export const locationOptions: Array<FilterOption<string>> = [
    { label: "Kathmandu", value: "Kathmandu" },
    { label: "Lalitpur", value: "Lalitpur" },
    { label: "Bhaktapur", value: "Bhaktapur" },
    { label: "Pokhara", value: "Pokhara" },
];

export const categoryOptions: Array<FilterOption<JobCategory>> = [
    { label: "IT & Software", value: "IT & Software" },
    { label: "Design & Creative", value: "Design & Creative" },
    { label: "Marketing & Social Media", value: "Marketing & Social Media" },
    { label: "Writing & Content", value: "Writing & Content" },
    { label: "Sales & Customer Service", value: "Sales & Customer Service" },
    { label: "Business & Administration", value: "Business & Administration" },
    { label: "Finance & Accounting", value: "Finance & Accounting" },
    { label: "Education & Tutoring", value: "Education & Tutoring" },
    { label: "Hospitality & Tourism", value: "Hospitality & Tourism" },
    { label: "Retail & Store Jobs", value: "Retail & Store Jobs" },
    { label: "Data & Research", value: "Data & Research" },
    { label: "Media & Communication", value: "Media & Communication" },
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

const getFirstParam = (value: string | string[] | undefined) => (
    Array.isArray(value) ? value[0] : value
);

const getParamValues = (value: string | string[] | undefined) => (
    (Array.isArray(value) ? value : value ? [value] : []).filter(Boolean)
);

const isOneOf = <TValue extends string>(
    value: string | undefined,
    options: Array<FilterOption<TValue>>,
): value is TValue => Boolean(value && options.some((option) => option.value === value));

const getValidValues = <TValue extends string>(
    value: string | string[] | undefined,
    options: Array<FilterOption<TValue>>,
): TValue[] => (
    getParamValues(value).filter((item): item is TValue => isOneOf(item, options))
);

const parseNumberParam = (value: string | undefined) => {
    if (!value) return undefined;

    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
};

export const parsePositiveIntegerParam = (value: string | string[] | undefined, fallback = 1) => {
    const firstValue = getFirstParam(value);
    if (!firstValue) return fallback;

    const parsed = Number(firstValue);
    if (!Number.isInteger(parsed) || parsed < 1) return fallback;

    return parsed;
};

const titleCase = (value: string) => (
    value
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
);

const formatMoney = (value: number, currency = "Rs") => `${currency} ${value.toLocaleString("en-US")}`;

const formatSalary = (salary: BackendJob["salary"]) => {
    if (!salary?.min && !salary?.max) return "Salary not disclosed";

    const currency = salary.currency || "Rs";
    if (salary.min && salary.max && salary.min !== salary.max) {
        return `${formatMoney(salary.min, currency)}-${salary.max.toLocaleString("en-US")}`;
    }

    return formatMoney(salary.min ?? salary.max ?? 0, currency);
};

const formatPostedAt = (dateValue?: string) => {
    if (!dateValue) return "Recently";

    const postedAt = new Date(dateValue);
    if (Number.isNaN(postedAt.getTime())) return "Recently";

    const diffMs = Date.now() - postedAt.getTime();
    const diffHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    const diffWeeks = Math.floor(diffDays / 7);
    return `${diffWeeks}w ago`;
};

export const getFilterLabel = (key: keyof JobListQuery, value?: string) => {
    if (!value) return null;

    const options = {
        jobType: jobTypeOptions,
        experienceLevel: experienceOptions,
        workMode: workModeOptions,
        category: categoryOptions,
        location: locationOptions,
    }[key as "jobType" | "experienceLevel" | "workMode" | "category" | "location"];

    if (options) {
        return options.find((option) => option.value === value)?.label ?? titleCase(value);
    }

    if (key === "isBeginnerFriendly") return "Beginner-friendly";
    return value;
};

export const getActiveFilters = (searchParams: SearchParams) => {
    const search = getFirstParam(searchParams.search);
    const locations = getParamValues(searchParams.location);
    const jobTypes = getValidValues(searchParams.jobType, jobTypeOptions);
    const experienceLevels = getValidValues(searchParams.experienceLevel, experienceOptions);
    const workModes = getValidValues(searchParams.workMode, workModeOptions);
    const categories = getValidValues(searchParams.category, categoryOptions);
    const minSalary = getFirstParam(searchParams.minSalary);
    const maxSalary = getFirstParam(searchParams.maxSalary);
    const isBeginnerFriendly = getFirstParam(searchParams.isBeginnerFriendly);
    const salary = salaryOptions.find((option) => (
        String(option.minSalary ?? "") === (minSalary ?? "") &&
        String(option.maxSalary ?? "") === (maxSalary ?? "")
    ));

    return [
        search ? { key: "search", label: search } : null,
        ...locations.map((location) => ({
            key: `location:${location}`,
            paramKey: "location",
            value: location,
            label: location,
        })),
        ...jobTypes.map((jobType) => ({
            key: `jobType:${jobType}`,
            paramKey: "jobType",
            value: jobType,
            label: getFilterLabel("jobType", jobType) ?? jobType,
        })),
        ...experienceLevels.map((experienceLevel) => ({
            key: `experienceLevel:${experienceLevel}`,
            paramKey: "experienceLevel",
            value: experienceLevel,
            label: getFilterLabel("experienceLevel", experienceLevel) ?? experienceLevel,
        })),
        ...workModes.map((workMode) => ({
            key: `workMode:${workMode}`,
            paramKey: "workMode",
            value: workMode,
            label: getFilterLabel("workMode", workMode) ?? workMode,
        })),
        ...categories.map((category) => ({
            key: `category:${category}`,
            paramKey: "category",
            value: category,
            label: getFilterLabel("category", category) ?? category,
        })),
        minSalary || maxSalary ? {
            key: "salary",
            keys: ["minSalary", "maxSalary"],
            label: salary?.label ?? "Custom salary",
        } : null,
        isBeginnerFriendly === "true" ? { key: "isBeginnerFriendly", label: "Beginner-friendly" } : null,
    ].filter((filter): filter is ActiveFilter => Boolean(filter));
};

export const getJobQueryFromSearchParams = (searchParams: SearchParams): JobListQuery => {
    const page = parsePositiveIntegerParam(searchParams.page);
    const search = getFirstParam(searchParams.search);
    const locations = getParamValues(searchParams.location);
    const jobTypes = getValidValues(searchParams.jobType, jobTypeOptions);
    const experienceLevels = getValidValues(searchParams.experienceLevel, experienceOptions);
    const workModes = getValidValues(searchParams.workMode, workModeOptions);
    const categories = getValidValues(searchParams.category, categoryOptions);
    const minSalary = getFirstParam(searchParams.minSalary);
    const maxSalary = getFirstParam(searchParams.maxSalary);
    const isBeginnerFriendly = getFirstParam(searchParams.isBeginnerFriendly);

    return {
        page,
        size: JOBS_PER_DISCOVER_PAGE,
        isVerified: true,
        search,
        location: locations.length > 0 ? locations : undefined,
        jobType: jobTypes.length > 0 ? jobTypes : undefined,
        experienceLevel: experienceLevels.length > 0 ? experienceLevels : undefined,
        workMode: workModes.length > 0 ? workModes : undefined,
        category: categories.length > 0 ? categories : undefined,
        minSalary: parseNumberParam(minSalary),
        maxSalary: parseNumberParam(maxSalary),
        isBeginnerFriendly: isBeginnerFriendly === "true" ? true : undefined,
    };
};

const withQuery = (
    path: string,
    params?: Record<string, string | number | boolean | Array<string | number | boolean> | undefined>,
) => {
    const query = new URLSearchParams();

    Object.entries(params ?? {}).forEach(([key, value]) => {
        if (value === undefined || value === "") return;
        if (Array.isArray(value)) {
            value.forEach((item) => {
                if (item !== "") query.append(key, String(item));
            });
            return;
        }
        query.set(key, String(value));
    });

    const queryString = query.toString();
    return `${API_BASE_URL}${path}${queryString ? `?${queryString}` : ""}`;
};

const authHeaders = (token: string | null) => (
    token ? { Authorization: `Bearer ${token}` } : undefined
);

const fetchJson = async <TData>(url: string, token: string | null) => {
    const response = await fetch(url, {
        headers: authHeaders(token),
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error(`Request failed with ${response.status}`);
    }

    return response.json() as Promise<ApiListResponse<TData>>;
};

export const mapJob = (job: BackendJob): Job => ({
    id: job._id ?? job.id ?? `${job.title}-${job.company}`,
    title: job.title ?? "Untitled role",
    company: job.hiringName ?? job.company ?? "Unknown hiring profile",
    hiringType: job.hiringType ?? "small-business",
    isHiringVerified: Boolean(job.isHiringVerified),
    category: job.category ?? "Other",
    location: job.location ?? "Location not listed",
    workMode: job.workMode ? titleCase(job.workMode) : "Flexible",
    type: job.jobType ? titleCase(job.jobType) : "Role",
    compensation: formatSalary(job.salary),
    postedAt: formatPostedAt(job.postedAt ?? job.createdAt),
    duration: job.duration,
    skills: job.skills ?? [],
    description: job.description,
    responsibilities: job.responsibilities ?? [],
    requirements: job.requirements ?? [],
    highlightedSkill: job.experienceLevel === "entry-level" ? "Entry-level" : undefined,
    isVerified: Boolean(job.isVerified),
    isBeginnerFriendly: Boolean(job.isBeginnerFriendly),
});

const mapSavedJobs = (user: DiscoverUser | null, fallbackJobs: Job[]): SavedJob[] => {
    const savedJobs = user?.savedJobs;

    if (!Array.isArray(savedJobs)) return [];

    return savedJobs
        .map((item) => {
            if (typeof item === "string") {
                const job = fallbackJobs.find((fallbackJob) => fallbackJob.id === item);
                return job ? { id: job.id, title: job.title, company: job.company } : null;
            }

            const savedJob = item as BackendJob;
            return {
                id: savedJob._id ?? savedJob.id ?? `${savedJob.title}-${savedJob.company}`,
                title: savedJob.title ?? "Saved role",
                company: savedJob.company ?? "Unknown company",
            };
        })
        .filter((job): job is SavedJob => Boolean(job))
        .slice(0, 3);
};

export const getSavedJobIds = (user: DiscoverUser | null): string[] => {
    const savedJobs = user?.savedJobs;
    if (!Array.isArray(savedJobs)) return [];

    return savedJobs
        .map((item) => {
            if (typeof item === "string") return item;
            const saved = item as BackendJob;
            return saved._id ?? saved.id ?? null;
        })
        .filter((id): id is string => Boolean(id));
};

export const getTrendingSearches = (jobs: Job[]): TrendingSearch[] => {
    const counts = new Map<string, number>();

    jobs.forEach((job) => {
        job.skills.forEach((skill) => {
            counts.set(skill, (counts.get(skill) ?? 0) + 1);
        });
    });

    return Array.from(counts.entries())
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 4)
        .map(([label, count]) => ({
            label,
            change: `+${count} open ${count === 1 ? "role" : "roles"}`,
        }));
};

export const fetchDiscoverData = async ({
    token,
    searchParams,
}: DiscoverFetchOptions): Promise<DiscoverData> => {
    const query = getJobQueryFromSearchParams(searchParams);
    let jobs: Job[] = [];
    let totalJobs = 0;
    let user: DiscoverUser | null = null;
    let error: string | null = null;

    try {
        const jobsResponse = await fetchJson<BackendJob[]>(withQuery("/api/jobs", query), token);
        jobs = (jobsResponse.data ?? []).map(mapJob);
        totalJobs = jobsResponse.totalJobs ?? jobs.length;
    } catch (err) {
        error = err instanceof Error ? err.message : "Failed to fetch jobs";
    }

    if (token) {
        try {
            const userResponse = await fetchJson<DiscoverUser>(withQuery("/api/users/me"), token);
            user = userResponse.data ?? null;
        } catch {
            user = null;
        }

        try {
            const savedResponse = await fetchJson<DiscoverUser>(withQuery("/api/users/me/saved-jobs"), token);
            user = savedResponse.data ? { ...user, ...savedResponse.data } : user;
        } catch {
            // Saved jobs are helpful, not critical for the page.
        }
    }

    return {
        jobs,
        totalJobs,
        savedJobs: mapSavedJobs(user, jobs),
        user,
        error,
    };
};
