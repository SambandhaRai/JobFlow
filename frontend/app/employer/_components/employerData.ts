const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

type ApiResponse = {
    success?: boolean;
    data?: unknown;
    message?: string;
    totalJobs?: number;
    totalApplications?: number;
};

export type EmployerJob = {
    _id?: string;
    title?: string;
    jobType?: string;
    location?: string;
    isVerified?: boolean;
    createdAt?: string;
    postedAt?: string;
};

export type JobApplication = {
    _id?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    resumeUrl?: string;
    status?: string;
    appliedAt?: string;
    createdAt?: string;
};

export type EmployerJobDetail = {
    _id?: string;
    title?: string;
    hiringName?: string;
    company?: string;
    location?: string;
};

const fetchJson = async (path: string, token: string | null) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        cache: "no-store",
    });

    if (!response.ok) {
        let message = `Request failed with ${response.status}`;
        try {
            const body = await response.json() as ApiResponse;
            message = body.message || message;
        } catch {}
        throw new Error(message);
    }

    return response.json() as Promise<ApiResponse>;
};

export const fetchEmployerJobs = async (
    token: string | null,
): Promise<{ jobs: EmployerJob[]; error: string | null }> => {
    if (!token) return { jobs: [], error: null };

    try {
        const me = await fetchJson("/api/users/me", token);
        const meData = me.data as { _id?: string; id?: string } | undefined;
        const userId = meData?._id ?? meData?.id;
        if (!userId) return { jobs: [], error: "Could not resolve your account." };

        const response = await fetchJson(`/api/jobs?postedByUserId=${userId}&size=100`, token);
        return { jobs: (Array.isArray(response.data) ? response.data : []) as EmployerJob[], error: null };
    } catch (err) {
        return { jobs: [], error: err instanceof Error ? err.message : "Failed to load your jobs" };
    }
};

export const fetchJobApplications = async (
    jobId: string,
    token: string | null,
): Promise<{ job: EmployerJobDetail | null; applications: JobApplication[]; error: string | null }> => {
    let job: EmployerJobDetail | null = null;
    let applications: JobApplication[] = [];
    let error: string | null = null;

    try {
        const jobResponse = await fetchJson(`/api/jobs/${jobId}`, token);
        job = (jobResponse.data ?? null) as EmployerJobDetail | null;
    } catch {
        job = null;
    }

    try {
        const response = await fetchJson(`/api/applications/job/${jobId}?size=100`, token);
        applications = (Array.isArray(response.data) ? response.data : []) as JobApplication[];
    } catch (err) {
        error = err instanceof Error ? err.message : "Failed to load applications";
    }

    return { job, applications, error };
};

export type EmployerCompany = {
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
    isVerified?: boolean;
};

export const fetchMyCompanies = async (
    token: string | null,
): Promise<{ companies: EmployerCompany[]; error: string | null }> => {
    if (!token) return { companies: [], error: null };

    try {
        const response = await fetchJson("/api/companies/me", token);
        return {
            companies: (Array.isArray(response.data) ? response.data : []) as EmployerCompany[],
            error: null,
        };
    } catch (err) {
        return { companies: [], error: err instanceof Error ? err.message : "Failed to load your company" };
    }
};

export const formatDate = (value?: string) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
};

export const resumePreviewUrl = (fileUrl: string) => (
    /^https?:\/\//i.test(fileUrl) ? fileUrl : `${API_BASE_URL}/uploads/${fileUrl}`
);
