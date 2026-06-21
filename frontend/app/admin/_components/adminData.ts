const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

type ApiResponse = {
    success?: boolean;
    data?: unknown[];
    message?: string;
    totalJobs?: number;
    totalUsers?: number;
    totalCompanies?: number;
    totalReports?: number;
};

export type AdminListResult<T> = {
    items: T[];
    total: number;
    error: string | null;
};

export type AdminJob = {
    _id?: string;
    title?: string;
    hiringName?: string;
    company?: string;
    location?: string;
    jobType?: string;
    category?: string;
    isVerified?: boolean;
    createdAt?: string;
};

export type AdminUser = {
    _id?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    role?: string;
    isVerified?: boolean;
    createdAt?: string;
};

export type AdminCompany = {
    _id?: string;
    name?: string;
    industry?: string;
    location?: string;
    email?: string;
    isVerified?: boolean;
    createdAt?: string;
};

export type AdminReportRef = { fullName?: string; email?: string; title?: string } | string | undefined;

export type AdminReport = {
    _id?: string;
    reason?: string;
    status?: string;
    message?: string;
    createdAt?: string;
    reporterId?: AdminReportRef;
    jobId?: AdminReportRef;
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
        } catch {
            // Keep the status-based message when the API does not return JSON.
        }
        throw new Error(message);
    }

    return response.json() as Promise<ApiResponse>;
};

const safeList = async <T>(
    path: string,
    token: string | null,
    totalKey: keyof ApiResponse,
): Promise<AdminListResult<T>> => {
    try {
        const body = await fetchJson(path, token);
        const items = (Array.isArray(body.data) ? body.data : []) as T[];
        const total = (body[totalKey] as number | undefined) ?? items.length;
        return { items, total, error: null };
    } catch (err) {
        return { items: [], total: 0, error: err instanceof Error ? err.message : "Failed to load" };
    }
};

export const fetchAdminJobs = (token: string | null) =>
    safeList<AdminJob>("/api/jobs?size=100", token, "totalJobs");

export const fetchAdminUsers = (token: string | null) =>
    safeList<AdminUser>("/api/users?role=user&size=100", token, "totalUsers");

export const fetchAdminEmployers = (token: string | null) =>
    safeList<AdminUser>("/api/users?role=employer&size=100", token, "totalUsers");

export const fetchAdminCompanies = (token: string | null) =>
    safeList<AdminCompany>("/api/companies?size=100", token, "totalCompanies");

export const fetchAdminReports = (token: string | null) =>
    safeList<AdminReport>("/api/reports?size=100", token, "totalReports");

export const formatDate = (value?: string) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
};

// Reports come back with reporterId/jobId either populated (object) or as a raw id string.
export const reportField = (ref: AdminReportRef, key: "fullName" | "email" | "title") => (
    ref && typeof ref === "object" ? (ref[key] ?? "—") : "—"
);
